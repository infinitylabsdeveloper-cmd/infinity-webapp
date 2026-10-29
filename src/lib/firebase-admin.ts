import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import rawConfig from '../../firebase-applet-config.json';

const projectId = process.env.FIREBASE_PROJECT_ID || rawConfig.projectId;

if (!getApps().length && projectId && !projectId.includes('YOUR_FIREBASE')) {
  try {
    initializeApp({
      projectId: projectId,
    });
  } catch (e) {
    console.warn('Firebase Admin SDK initialization skipped (no active project ID configured):', e);
  }
}

export const adminAuth = getApps().length > 0 ? getAuth() : null;
