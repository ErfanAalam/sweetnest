# Security Guide - Sweet Nest Platform

## 🚨 CRITICAL: Credential Exposure Response

### If Credentials Were Exposed (Like in Your Case):

1. **IMMEDIATELY regenerate ALL credentials**:
   - Firebase API Keys
   - Firebase Private Key
   - Cloudinary API Keys
   - Cashfree API Credentials
   - Email passwords/app passwords

2. **Clear any leaked credentials from history**:
   ```bash
   # Remove from Git history
   git log --all -p -- ".env.local" | grep -i "firebase\|api\|key"
   
   # Force push to remove from remote (if already committed - ⚠️ use caution)
   git filter-branch -f --tree-filter 'rm -f .env.local' -- --all
   git push origin --force --all
   ```

3. **Update .gitignore**:
   ```bash
   # .gitignore
   .env.local
   .env.*.local
   firebase-*.json
   credentials.json
   ```

4. **Never commit credentials again**:
   - Use `.env.local` for local development only
   - Use `.env.example` for template
   - Use platform secrets (Vercel, Docker secrets, etc.) for production

---

## 🔐 Secret Management Best Practices

### Level 1: Local Development

**File: `.env.local` (⚠️ Never commit)**

```bash
# .env.local (local development only)
DATABASE_URL="postgresql://local:password@localhost/sweetnest"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_SERVICE_ACCOUNT='{...full-json...}'
```

**Ensure it's ignored**:
```bash
echo ".env.local" >> .gitignore
git status  # Should show .env.local is ignored
```

### Level 2: Vercel Production

**Use Vercel Dashboard for secrets**:

1. Go to **Settings** → **Environment Variables**
2. Add secrets (marked as private):
   - `DATABASE_URL`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_SERVICE_ACCOUNT`
   - `CASHFREE_CLIENT_SECRET`
   - `EMAIL_PASSWORD`

3. Don't use `NEXT_PUBLIC_*` for secrets
4. Vercel encrypts these automatically

### Level 3: Self-Hosted / Docker

**Use Docker secrets or environment management**:

```bash
# Docker Compose example
services:
  app:
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
```

Set variables via:
- Docker secrets: `docker secret create db_url /path/to/secret`
- Environment files: Pass via `--env-file`
- Orchestration: Kubernetes secrets, HashiCorp Vault, AWS Secrets Manager

---

## 🔒 Credential Categories

### PUBLIC (Safe to Share - use `NEXT_PUBLIC_*`)

```env
# These are embedded in client JavaScript
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyD..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud"
NEXT_PUBLIC_APP_URL="https://sweetne.st"
NEXT_PUBLIC_CASHFREE_CLIENT_ID="123456"
```

### PRIVATE (Never Share - no `NEXT_PUBLIC_` prefix)

```env
# Database
DATABASE_URL="postgresql://user:PASSWORD@host/db"

# Firebase
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END"
FIREBASE_SERVICE_ACCOUNT='{...}'
FIREBASE_CLIENT_EMAIL="...@iam.gserviceaccount.com"

# Payments
CASHFREE_CLIENT_SECRET="secret-key-xxx"

# Email
EMAIL_PASSWORD="app-password-xyz"

# JWT
JWT_SECRET="your-secret-32-chars-minimum"
NEXTAUTH_SECRET="another-secret-32-chars-min"
```

---

## 🛡️ API Security

### Input Validation

```typescript
// ✅ Good: Validate all inputs
import { z } from 'zod';

const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/);
const email = z.string().email();

// ❌ Bad: Direct use without validation
const phone = req.body.phone;  // Could be anything!
```

### Authentication Checks

```typescript
// ✅ Good: Verify user token on every request
const user = verifyToken(authHeader);
if (!user) return Unauthorized();

// ❌ Bad: Trust client-provided user ID
const userId = req.body.userId;  // Could be any user!
```

### SQL Injection Prevention

```typescript
// ✅ Good: Use Prisma (parameterized queries)
const user = await prisma.user.findUnique({
  where: { email: userEmail }
});

// ❌ Bad: String concatenation
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

### Rate Limiting

```typescript
// ✅ Good: Limit API requests
// Use middleware like rate-limit-redis
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // 100 requests per window
});

app.post('/api/auth/otp', limiter, otpHandler);

// ❌ Bad: No rate limiting allows brute force attacks
app.post('/api/auth/otp', otpHandler);
```

---

## 📧 Email Security

### Don't Store Passwords

```typescript
// ✅ Good: Use app passwords or service accounts
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD  // App password, not account password
  }
});

// ❌ Bad: Storing actual Gmail password
// Never do this!
pass: 'myActualGmailPassword'
```

### Use TLS for Email

```typescript
// ✅ Good: Use secure connection
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,  // TLS will upgrade connection
  auth: { ... }
});

// Or use port 465 with SSL
// secure: true, port: 465
```

---

## 🔑 Firebase Security

### Service Account Private Key

The private key shown in your error is like a password to your entire Firebase project. Anyone with it can:
- Read/write all user data
- Modify authentication rules
- Delete the project
- Access all stored files

**Always:**
1. ✅ Keep in `.env.local` only (not committed)
2. ✅ Regenerate immediately if exposed
3. ✅ Use separate keys for dev/prod
4. ✅ Rotate quarterly
5. ✅ Never log or print it
6. ✅ Don't share in emails/chats

### Firebase Rules (Firestore/Database)

```javascript
// ✅ Good: Enforce authentication
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Only owner can read/write
      allow read, write: if request.auth.uid == userId;
    }
  }
}

// ❌ Bad: Allow all access
match /{document=**} {
  allow read, write;  // DANGEROUS!
}
```

---

## 🚀 Production Security Checklist

Before deploying to production:

- [ ] All credentials regenerated
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets committed to Git
- [ ] HTTPS enabled (all traffic encrypted)
- [ ] Vercel/production environment variables set
- [ ] Firebase rules updated for production
- [ ] Database backups configured
- [ ] Error logging doesn't expose sensitive data
- [ ] Rate limiting implemented on APIs
- [ ] CORS properly configured
- [ ] Admin routes protected
- [ ] User roles verified on backend
- [ ] Payment provider set to production mode
- [ ] Email service tested and working
- [ ] Monitoring/alerts set up

---

## 🔍 Monitoring & Auditing

### Enable Firebase Logs

```bash
# Firebase CLI
firebase functions:log

# Or in Firebase Console: Logs section
```

### Monitor Suspicious Activity

```typescript
// Log all authentication events
async function logAuthEvent(event: string, userId: string, details: any) {
  const log = await prisma.emailLog.create({
    data: {
      to: userId,
      subject: `Auth Event: ${event}`,
      body: JSON.stringify(details),
      type: 'AUTH',
      status: 'LOGGED'
    }
  });
}

// Track payment failures
logAuthEvent('payment_failed', userId, {
  bookingId,
  amount,
  error: response.error,
  timestamp: new Date()
});
```

### Set Up Alerts

- Database query anomalies
- Multiple failed login attempts
- Unusual payment patterns
- API rate limit breaches
- Firebase quota exceeded

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Vercel Security](https://vercel.com/docs/security)

---

## 🆘 If Breach Suspected

1. **IMMEDIATELY rotate all credentials**
2. **Notify users** (if personal data accessed)
3. **Enable 2FA** on Firebase/cloud accounts
4. **Review access logs** for suspicious activity
5. **Update all passwords** immediately
6. **Enable audit logging** for future detection
7. **Consider security audit** from professional firm

---

**Last Updated**: 26 May 2026  
**Status**: Production Ready ✅
