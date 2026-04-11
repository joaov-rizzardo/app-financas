import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

/**
 * Firebase configuration.
 * Values are read from environment variables prefixed with EXPO_PUBLIC_
 * so they are bundled by Expo at build time and available on the client.
 *
 * Copy .env.example to .env and fill in your credentials before running.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initialisation during hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export default app;
