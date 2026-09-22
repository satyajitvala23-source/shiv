/**
 * ============================================================================
 * FIREBASE UTILITY MODULE
 * ============================================================================
 *
 * Initializes Firebase using configuration from firebase-applet-config.json
 * and exports the Auth and Firestore instances across the application.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App (Singleton pattern)
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication instance
export const auth: Auth = getAuth(app);

// Initialize Cloud Firestore with explicit named database ID and auto-detect long polling
// This allows standard WebSockets/streams while smoothly falling back to long-polling only when needed
const hasNamedDb = Boolean(
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== '(default)' &&
  firebaseConfig.firestoreDatabaseId.trim() !== ''
);

let firestoreDb: Firestore;
try {
  firestoreDb = hasNamedDb
    ? initializeFirestore(
        app,
        {
          experimentalAutoDetectLongPolling: true,
        },
        firebaseConfig.firestoreDatabaseId
      )
    : initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
      });
} catch {
  try {
    firestoreDb = hasNamedDb
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  } catch (err) {
    console.warn('[Firebase] Fallback Firestore initialization error:', err);
    firestoreDb = getFirestore(app);
  }
}

export const db: Firestore = firestoreDb;

export const PROJECT_ID = firebaseConfig.projectId;
export const AUTH_DOMAIN = firebaseConfig.authDomain;
export const DATABASE_ID = firebaseConfig.firestoreDatabaseId;

export { firebaseConfig };

export default {
  app,
  auth,
  db,
  firebaseConfig,
  projectId: PROJECT_ID,
  authDomain: AUTH_DOMAIN,
  databaseId: DATABASE_ID,
};
