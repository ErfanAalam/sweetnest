import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

if (
  typeof window !== 'undefined' &&
  (!apiKey || apiKey.startsWith('FILL_IN') || apiKey.startsWith('your-'))
) {
  console.error(
    '[Sweet Nest] Firebase is not configured.\n' +
    'Set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_APP_ID in .env.local\n' +
    'Get them from: Firebase Console → Project Settings → General → Your apps → Web app config'
  );
}

const firebaseConfig = {
  apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
