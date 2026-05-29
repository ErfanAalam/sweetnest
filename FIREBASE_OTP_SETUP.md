# Firebase OTP Setup Guide - Sweet Nest

## Security First: Protecting Your Credentials

**CRITICAL**: Never expose `FIREBASE_PRIVATE_KEY` or other secrets in code, commits, or conversations.

### Step 1: Create/Access Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select existing project
3. Project ID: `sweetnest-72de0` (as shown in your credentials)

### Step 2: Generate Fresh Credentials (Due to Exposure)

Since credentials were exposed, you MUST regenerate them:

#### Client-Side Config (Public - Safe to Share):
1. Go to **Project Settings** → **General**
2. Under "Your apps", find your Web app (or create one)
3. Copy the configuration:

```javascript
{
  "apiKey": "YOUR_NEW_API_KEY",
  "authDomain": "sweetnest-72de0.firebaseapp.com",
  "projectId": "sweetnest-72de0",
  "storageBucket": "sweetnest-72de0.appspot.com",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "appId": "YOUR_APP_ID"
}
```

#### Server-Side Service Account (Secret - Keep Private):
1. Go to **Project Settings** → **Service Accounts**
2. Click **"Generate New Private Key"** (to replace exposed key)
3. Copy the entire JSON (keep it secret!)

### Step 3: Update .env.local

Create/update your `.env.local` file with **PROPER SECURITY**:

```env
# ========== FIREBASE CLIENT CONFIG (PUBLIC) ==========
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_NEW_API_KEY_HERE"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="sweetnest-72de0.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="sweetnest-72de0"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="sweetnest-72de0.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"

# ========== FIREBASE SERVER CONFIG (SECRET - DO NOT SHARE) ==========
# Copy the entire JSON from Firebase Console → Project Settings → Service Accounts
# Keep this secret and NEVER commit to Git!
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"sweetnest-72de0",...}'
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@sweetnest-72de0.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...YOUR_PRIVATE_KEY...\n-----END PRIVATE KEY-----\n"
```

**NEVER** share `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PRIVATE_KEY`, or `FIREBASE_CLIENT_EMAIL`.

### Step 4: Enable Phone Authentication in Firebase

1. Go to **Authentication** → **Sign-in method**
2. Click **Phone** and toggle **Enable**
3. Under **Phone providers**, select:
   - ✅ **Firebase App Verification**
   - For testing: Add test phone numbers

### Step 5: Enable reCAPTCHA

Phone OTP requires reCAPTCHA protection:

1. In **Authentication** → **Sign-in method** → **Phone**
2. Ensure reCAPTCHA is configured
3. For Web: reCAPTCHA v2 (automatically enabled)

### Step 6: Add Authorized Domains

The domain must be authorized to use Firebase Auth:

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add:
   - ✅ `localhost` (local development)
   - ✅ `127.0.0.1` (local development)
   - ✅ Your production domain (e.g., `sweetne.st`)

### Step 7: Install Dependencies

```bash
cd /Users/hemantsharma/Documents/sweetnest
npm install firebase firebase-admin react-otp-input
```

### Step 8: Setup .gitignore

**CRITICAL**: Prevent credential leaks:

```bash
# Add to .gitignore
.env.local
.env.*.local
firebase-credentials.json
```

Verify:
```bash
git status
# Should show .env.local as ignored
```

## Testing OTP

### Local Testing (SMS Won't Actually Send):

1. Go to **Firebase Console** → **Authentication**
2. In **Phone** settings, add **Test phone numbers**:
   - Phone: `+919999999999`
   - OTP: `123456` (or any 6 digits)

3. Use test number in `/otp-login` to receive test OTP

### Production Testing:

1. Remove test numbers from Firebase
2. Real SMS will be sent to users
3. Each user gets one SMS per request
4. **SMS quota limits apply** (check Firebase pricing)

## Troubleshooting OTP Errors

### ❌ "auth/invalid-api-key"
- **Cause**: API key is missing or invalid
- **Fix**: Regenerate API key in Firebase Console
- **Check**: Verify `NEXT_PUBLIC_FIREBASE_API_KEY` in `.env.local`

### ❌ "auth/app-not-authorized"
- **Cause**: API key restrictions or service not enabled
- **Fix**: 
  - Go to **APIs & Services** → **Credentials**
  - Edit your API key → **Application restrictions** → **None**
  - Enable **Firebase Authentication API**

### ❌ "auth/operation-not-allowed"
- **Cause**: Phone sign-in not enabled
- **Fix**: Go to **Authentication** → **Sign-in method** → **Phone** → **Enable**

### ❌ "auth/unauthorized-domain"
- **Cause**: Domain not authorized in Firebase
- **Fix**: Add domain to **Authentication** → **Settings** → **Authorized domains**

### ❌ "auth/captcha-check-failed"
- **Cause**: reCAPTCHA verification failed
- **Fix**: Refresh page and try again

### ❌ "auth/quota-exceeded"
- **Cause**: Daily SMS quota exceeded
- **Fix**: Wait until next day or upgrade Firebase plan

## Using OTP Authentication

### User Flow:

1. **Visit** → `/otp-login`
2. **Enter** → 10-digit phone number
3. **Receive** → 6-digit OTP via SMS
4. **Enter** → OTP to complete login
5. **Redirect** → Dashboard or Admin Panel

### API Endpoints:

```bash
# Send OTP
POST /api/auth/otp
Body: { "action": "send-otp", "phoneNumber": "+919876543210" }

# Verify OTP
POST /api/auth/otp
Body: { "action": "verify-otp", "phoneNumber": "+919876543210", "uid": "FIREBASE_UID" }
```

## Security Best Practices

1. ✅ **Regenerate credentials** if exposed
2. ✅ **Store `.env.local` locally only** - never commit to Git
3. ✅ **Use `NEXT_PUBLIC_*` only for public data**
4. ✅ **Keep server secrets** in `.env.local` with `FIREBASE_` prefix
5. ✅ **Rotate keys periodically** (quarterly recommended)
6. ✅ **Monitor Firebase logs** for suspicious activity
7. ✅ **Use strong reCAPTCHA settings** to prevent abuse
8. ✅ **Enable Cloud Audit Logs** for compliance

## Environment Variables Summary

| Variable | Visibility | Purpose |
|----------|-----------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public | Client authentication |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public | Project identifier |
| `FIREBASE_SERVICE_ACCOUNT` | **Secret** | Server authentication |
| `FIREBASE_PRIVATE_KEY` | **Secret** | Admin SDK operations |
| `FIREBASE_CLIENT_EMAIL` | **Secret** | Service account email |

## Production Deployment

### Vercel Deployment:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add all `NEXT_PUBLIC_*` variables (public)
3. Add `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PRIVATE_KEY` (encrypted)
4. Update Firebase **Authorized domains** with Vercel domain

### Self-Hosted Deployment:

1. Ensure `.env.local` is **not in Git**
2. Set environment variables in your server
3. Use secret management (AWS Secrets Manager, HashiCorp Vault, etc.)
4. Add your domain to Firebase authorized domains

## Need Help?

- Firebase Phone Auth Docs: https://firebase.google.com/docs/auth/web/phone-auth
- Common Issues: https://firebase.google.com/docs/auth/troubleshooting
- Firebase Console: https://console.firebase.google.com

---

**Last Updated**: 26 May 2026  
**Firebase SDK**: Latest  
**Next.js Version**: 14+
