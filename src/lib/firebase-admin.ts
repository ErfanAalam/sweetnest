import admin from 'firebase-admin';

function initAdmin() {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');

  // Accept either raw JSON, or base64-encoded JSON. Base64 is required on hosts
  // like AWS Amplify, which split env-var values on commas (the JSON is full of
  // them) and would otherwise truncate the value.
  let jsonStr = raw.trim();
  if (!jsonStr.startsWith('{')) {
    try {
      jsonStr = Buffer.from(jsonStr, 'base64').toString('utf8');
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is neither JSON nor valid base64');
    }
  }

  let sa: admin.ServiceAccount;
  try {
    sa = JSON.parse(jsonStr);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON. Paste the full JSON (or its base64) from Firebase Console → Service Accounts → Generate new private key');
  }

  return admin.initializeApp({ credential: admin.credential.cert(sa) });
}

let _adminAuth: admin.auth.Auth;

try {
  const app = initAdmin();
  _adminAuth = admin.auth(app);
} catch (err) {
  console.error('[Firebase Admin] Initialization failed:', (err as Error).message);
  // Provide a stub so the module loads; verifyIdToken will throw at call time
  _adminAuth = {
    verifyIdToken: async (_token: string) => {
      throw new Error('Firebase Admin SDK is not initialized. Check FIREBASE_SERVICE_ACCOUNT in your env.');
    },
  } as unknown as admin.auth.Auth;
}

export const adminAuth = _adminAuth;
