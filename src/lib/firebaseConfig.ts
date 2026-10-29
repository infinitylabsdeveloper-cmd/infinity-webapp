/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import rawConfig from '../../firebase-applet-config.json';

function cleanVal(envVal: string | undefined, fileVal: string | undefined, fallback = ''): string {
  const isReal = (v?: string) =>
    Boolean(v && v.trim() && !v.toUpperCase().includes('YOUR_') && v !== 'remixed-project-id');
  if (isReal(fileVal)) return fileVal!.trim();
  if (isReal(envVal)) return envVal!.trim();
  return fallback;
}

export const firebaseConfig = {
  apiKey: cleanVal(import.meta.env.VITE_FIREBASE_API_KEY, rawConfig.apiKey),
  authDomain: cleanVal(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, rawConfig.authDomain),
  projectId: cleanVal(import.meta.env.VITE_FIREBASE_PROJECT_ID, rawConfig.projectId),
  storageBucket: cleanVal(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, rawConfig.storageBucket),
  messagingSenderId: cleanVal(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, rawConfig.messagingSenderId),
  appId: cleanVal(import.meta.env.VITE_FIREBASE_APP_ID, rawConfig.appId),
};

export const databaseId =
  rawConfig.firestoreDatabaseId && rawConfig.firestoreDatabaseId !== '(default)' && !rawConfig.firestoreDatabaseId.includes('ai-studio-')
    ? rawConfig.firestoreDatabaseId
    : cleanVal(import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID, rawConfig.firestoreDatabaseId, '(default)');

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== 'disconnected-demo');

// Initialize Firebase App gracefully
export const app = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : (getApps().length > 0 ? getApp() : initializeApp({ apiKey: 'disconnected-demo', projectId: 'disconnected-demo' }));

// Initialize Firestore safely with fallback
function initFirestoreSafely() {
  if (!isFirebaseConfigured) return null;
  try {
    if (databaseId && databaseId !== '(default)') {
      return getFirestore(app, databaseId);
    }
    return getFirestore(app);
  } catch (err) {
    console.warn('Initializing default Firestore database instance:', err);
    try {
      return getFirestore(app);
    } catch (e) {
      return null;
    }
  }
}

export const db = initFirestoreSafely();
export const auth = isFirebaseConfigured ? getAuth(app) : null;

export default app;
