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

// Initialize Cloud Firestore with explicit named database ID and force long polling
// (Bypasses streaming proxy buffering in cloud sandboxes and iframe preview environments)
let firestoreDb: Firestore;
try {
  firestoreDb = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  firestoreDb = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
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
