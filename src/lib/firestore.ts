/**
 * ============================================================================
 * SHIV COMPUTER - FIRESTORE DATA ACCESS LAYER
 * ============================================================================
 *
 * Logical Collections:
 * - "users": { uid, name, email, phone, createdAt, role }
 * - "form_submissions": { submissionId, userId, name, phone, email, formType, formData, status, createdAt, updatedAt }
 * - "settings": { websiteContent, updatedAt }
 * - "admins": { uid, email, role, createdAt }
 *
 * Strict Security & Error Handling:
 * - Adheres to the Firebase Integration Skill error handling pattern.
 * - Throws structured FirestoreErrorInfo for permission diagnostics.
 * - Server timestamps used for creation and updates.
 * - Real-time listeners for Admin Panel and User Panel.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase-config';
import { FormSubmission, CustomerUser, WebsiteContent, AdminRecord } from '../types';

// Collection references
export const USERS_COLLECTION = 'users';
export const SUBMISSIONS_COLLECTION = 'form_submissions';
export const SETTINGS_COLLECTION = 'settings';
export const ADMINS_COLLECTION = 'admins';
export const USERNAMES_COLLECTION = 'usernames';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function logFirestoreListenerIssue(context: string, error: any) {
  const msg = error?.message || String(error);
  const isOffline =
    msg.includes('offline') ||
    error?.code === 'unavailable' ||
    msg.includes('client is offline');

  if (isOffline) {
    console.info(`[Firestore] ${context}: offline mode / local cache active.`);
  } else {
    console.warn(`[Firestore] ${context} notice:`, msg);
  }
}

/**
 * ============================================================================
 * 1. FORM SUBMISSIONS
 * ============================================================================
 */

export interface CreateSubmissionParams {
  submissionId: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  formType: string;
  formData: Record<string, any>;
  status?: string;
}

/**
 * Create a new record in "form_submissions"
 */
export async function createFormSubmission(params: CreateSubmissionParams): Promise<string> {
  const docPath = `${SUBMISSIONS_COLLECTION}/${params.submissionId}`;
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, params.submissionId);
    const payload = {
      submissionId: params.submissionId,
      userId: params.userId,
      name: params.name,
      phone: params.phone,
      email: params.email,
      formType: params.formType,
      formData: params.formData || {},
      status: params.status || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, payload);
    return params.submissionId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

/**
 * Real-time listener for ALL submissions (Admin Panel)
 */
export function subscribeToAllSubmissions(
  onData: (submissions: FormSubmission[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, SUBMISSIONS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const submissions: FormSubmission[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          submissionId: data.submissionId || docSnap.id,
          userId: data.userId || '',
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          formType: data.formType || '',
          formData: data.formData || {},
          status: data.status || 'pending',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          adminNotes: data.adminNotes || '',
        };
      });
      onData(submissions);
    },
    (error) => {
      logFirestoreListenerIssue('Submissions listener', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Real-time listener for CURRENT USER'S own submissions (User Panel)
 * Enforces role isolation: users only query documents where userId == current user UID
 */
export function subscribeToUserSubmissions(
  userId: string,
  onData: (submissions: FormSubmission[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) return () => {};

  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const submissions: FormSubmission[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          submissionId: data.submissionId || docSnap.id,
          userId: data.userId || userId,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          formType: data.formType || '',
          formData: data.formData || {},
          status: data.status || 'pending',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          adminNotes: data.adminNotes || '',
        };
      });
      // Sort newest first
      submissions.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      onData(submissions);
    },
    (error) => {
      logFirestoreListenerIssue('User submissions listener', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Admin: Update submission status and notes
 */
export async function updateSubmissionStatusDoc(
  submissionId: string,
  status: string,
  adminNotes?: string
): Promise<void> {
  const docPath = `${SUBMISSIONS_COLLECTION}/${submissionId}`;
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    const updates: Record<string, any> = {
      status,
      updatedAt: serverTimestamp(),
    };
    if (adminNotes !== undefined) {
      updates.adminNotes = adminNotes;
    }
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Admin: Delete a submission record
 */
export async function deleteSubmissionDoc(submissionId: string): Promise<void> {
  const docPath = `${SUBMISSIONS_COLLECTION}/${submissionId}`;
  try {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * ============================================================================
 * 2. USERS
 * ============================================================================
 */

/**
 * Real-time listener for ALL users (Admin Panel)
 */
export function subscribeToAllUsers(
  onData: (users: CustomerUser[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(collection(db, USERS_COLLECTION));

  return onSnapshot(
    q,
    (snapshot) => {
      const usersList: CustomerUser[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        let joinedDate = d.joinedDate || '';
        if (!joinedDate && d.createdAt) {
          try {
            joinedDate = d.createdAt.toDate ? d.createdAt.toDate().toISOString().split('T')[0] : '';
          } catch {
            joinedDate = '';
          }
        }
        return {
          id: docSnap.id,
          name: d.name || 'User',
          username: d.username || '',
          email: d.email || '',
          phone: d.phone || '',
          address: d.address || '',
          role: d.role || 'user',
          status: d.status || 'Active',
          joinedDate: joinedDate || new Date().toISOString().split('T')[0],
          totalApplications: d.totalApplications || 0,
          totalPaid: d.totalPaid || 0,
        };
      });
      onData(usersList);
    },
    (error) => {
      logFirestoreListenerIssue('Users listener', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Update user profile
 */
export async function updateUserProfileDoc(
  userId: string,
  updates: Partial<CustomerUser>
): Promise<void> {
  const docPath = `${USERS_COLLECTION}/${userId}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Admin: Toggle user status (Active / Inactive)
 */
export async function updateUserStatusDoc(
  userId: string,
  status: 'Active' | 'Inactive'
): Promise<void> {
  const docPath = `${USERS_COLLECTION}/${userId}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Admin: Delete user document
 */
export async function deleteUserDoc(userId: string): Promise<void> {
  const docPath = `${USERS_COLLECTION}/${userId}`;
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * ============================================================================
 * 3. SETTINGS
 * ============================================================================
 */

export const SETTINGS_WEBSITE_DOC = 'website';

/**
 * Real-time listener for website settings
 */
export function subscribeToWebsiteSettings(
  onData: (content: Partial<WebsiteContent>) => void
) {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_WEBSITE_DOC);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.websiteContent) {
          onData(data.websiteContent);
        }
      }
    },
    (err) => {
      logFirestoreListenerIssue('Settings listener', err);
    }
  );
}

/**
 * Admin: Save website settings to Firestore
 */
export async function saveWebsiteSettingsDoc(content: Partial<WebsiteContent>): Promise<void> {
  const docPath = `${SETTINGS_COLLECTION}/${SETTINGS_WEBSITE_DOC}`;
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_WEBSITE_DOC);
    await setDoc(
      docRef,
      {
        websiteContent: content,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * ============================================================================
 * 4. ADMINS (RBAC Verification)
 * ============================================================================
 */

/**
 * Verify whether a given UID is authorized as an administrator
 */
export async function isUidAuthorizedAdmin(uid: string): Promise<boolean> {
  if (!uid) return false;

  // Immediate check for verified admin UID or current user email
  if (
    uid === 'e3YVoiB8zSMJgUoYrM6XNPPn95X2' ||
    auth.currentUser?.email === 'satyajitvala23@gmail.com' ||
    auth.currentUser?.email === 'admin@shivcomputer.com' ||
    auth.currentUser?.email === 'satu@shivcomputer.com'
  ) {
    return true;
  }

  // 1. Check "admins" collection
  try {
    const adminDocRef = doc(db, ADMINS_COLLECTION, uid);
    const snap = await getDoc(adminDocRef);
    if (snap.exists() && snap.data()?.role === 'admin') {
      return true;
    }
  } catch {
    // ignore
  }

  // 2. Check "users" collection for role === 'admin'
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists() && userSnap.data()?.role === 'admin') {
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

/**
 * Create or register an admin record in Firestore
 */
export async function registerAdminRecord(admin: AdminRecord): Promise<void> {
  const docPath = `${ADMINS_COLLECTION}/${admin.uid}`;
  try {
    const docRef = doc(db, ADMINS_COLLECTION, admin.uid);
    await setDoc(docRef, {
      uid: admin.uid,
      email: admin.email,
      role: 'admin',
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}
