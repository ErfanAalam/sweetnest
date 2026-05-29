import admin from 'firebase-admin';

function initAdmin() {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');

  let sa: admin.ServiceAccount;
  try {
    sa = JSON.parse(raw);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON. Paste the full JSON from Firebase Console → Service Accounts → Generate new private key');
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
