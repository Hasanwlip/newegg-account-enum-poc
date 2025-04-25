---
name: "🐛 Bug Report – Account Enumeration via Login Error Message"
about: "Login form leaks account existence via distinct error messages."
labels: ["bug", "security", "needs-triage"]
assignees: [hasanwlip]
---

# 🐛 Account Enumeration via Distinct Login Error Messages

The login form at [Newegg.ca](https://www.newegg.ca) leaks whether an email is registered or not based on two different error messages. An attacker can use this to enumerate valid accounts without authentication.

---

## 📝 Environment

- **URL:** [https://www.newegg.ca/](https://www.newegg.ca)
- **Content-Type:** `application/x-www-form-urlencoded`
- **Platform:** Public-facing login system (custom frontend)

---

## 🔍 Reproduction Steps

### 1. Open Login Page (Manual or Automated)

```bash
URL: https://www.newegg.ca
Click on "My Account" to open login form
```

### 2. Submit Login Form with Different Emails

Manually or via automated script (like Playwright):

- Enter an **unregistered email** → Submit → Error: `We didn't find any matches.`
- Enter a **registered email** → Submit → Redirects or shows password field.

### 3. Observe Behavior

By observing this behavioral difference, an attacker can determine whether a user exists or not.

---

## 💡 PoC (Proof of Concept)

A working Playwright script and short video proof have been prepared and uploaded:

- GitHub: [https://github.com/hasanwlip/newegg-account-enum-poc](https://github.com/hasanwlip/newegg-account-enum-poc)
- Includes:
  - `newegg-checker.js` (script)
  - `emails.txt` (sample input)
  - `results.csv`, `found.txt` (output)
  - `proof.mp4` (screen recording)

---

## ⚡ Severity & Impact

- **Type:** Account Enumeration
- **Risk:** Medium to High
- **CVE Mapping:** OWASP A01:2021 – Broken Access Control / A05:2021 – Security Misconfiguration

### Attack Scenario:
An attacker with no login access can brute force or mass test emails (e.g., from data leaks) and confirm which emails are registered on Newegg.

### Resulting Threats:
- Targeted phishing against real Newegg users
- Credential stuffing using reused leaked passwords
- Breach of user privacy (especially under GDPR)

---

## 🔢 CVSS Score (Estimated)

- **Attack Vector:** Network
- **Attack Complexity:** Low
- **Privileges Required:** None
- **User Interaction:** None
- **Confidentiality:** Low
- **Integrity:** None
- **Availability:** None

**Estimated Score:** 5.3 (Medium)

---

## 🔐 Suggested Fix

Return a **single, generic error** message regardless of email validity:

> **"Invalid email or password."**

This ensures attackers cannot distinguish between registered and unregistered accounts.

---

## 📊 Timeline

- **2025-04-25:** Issue discovered and verified
- **2025-04-26:** PoC completed and video recorded

---

## 📚 References

- OWASP A05:2021 – Broken Authentication
- [Account Enumeration Risks](https://portswigger.net/web-security/authentication/password-based/enumeration)
- [Playwright](https://playwright.dev/) for reproducibility

---

**This issue is reported for responsible disclosure purposes only.**

