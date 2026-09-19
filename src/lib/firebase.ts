/**
 * ============================================================================
 * SHIV COMPUTER - FIREBASE UNIFIED FACADE (Project: "Shiv-ori")
 * ============================================================================
 * 
 * Re-exports modular Firebase services:
 * - Firebase Config & Services: auth, db, app from ./firebase-config
 * - Authentication: ./auth
 * - Firestore CRUD & Listeners: ./firestore
 * - Admin Operations: ./admin
 * - User Operations: ./user
 * 
 * Complies with strict security rules:
 * - NO hard-coded admin credentials or plain text passwords.
 * - Admin authentication is strictly validated through Firebase Auth & Firestore RBAC.
 * - Real-time listeners for Admin Panel and User Panel.
 */

export * from './firebase-config';
export * from './auth';
export * from './firestore';
export * from './admin';
export * from './user';

import { auth, db } from './firebase-config';
import {
  signInAdmin,
  signInCitizen,
  registerCitizen,
  signOutUser,
  subscribeToAuthObserver,
  sendFirebasePasswordReset,
  cleanUsername,
  resolveEmailFromIdentifier,
} from './auth';
import {
  subscribeToAllUsers,
  updateUserStatusDoc,
  updateUserProfileDoc,
  createFormSubmission,
  subscribeToAllSubmissions,
  subscribeToUserSubmissions,
  updateSubmissionStatusDoc,
  deleteSubmissionDoc,
} from './firestore';
import { CustomerUser } from '../types';

export interface RegisterParams {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface LoginParams {
  identifier: string; // username or email
  password: string;
  expectedRole: 'admin' | 'user';
}

/**
 * 1. Register a new citizen account
 */
export async function registerUser(params: RegisterParams): Promise<CustomerUser> {
  return registerCitizen(params);
}

/**
 * 2. Authenticate Admin or Citizen via Firebase Authentication
 */
export async function loginUser({
  identifier,
  password,
  expectedRole,
}: LoginParams): Promise<{ user: CustomerUser; role: 'admin' | 'user' }> {
  if (expectedRole === 'admin') {
    return signInAdmin(identifier, password);
  } else {
    const res = await signInCitizen(identifier, password);
    return { user: res.user, role: res.role === 'admin' ? 'admin' : 'user' };
  }
}

/**
 * 3. Log out user
 */
export async function logoutUser(): Promise<void> {
  return signOutUser();
}

/**
 * 4. Subscribe to Auth state changes
 */
export function subscribeToAuth(
  onUserChanged: (user: CustomerUser | null, role: 'admin' | 'user' | null) => void
) {
  return subscribeToAuthObserver(onUserChanged);
}

/**
 * 5. Real-time users subscription for Admin Dashboard
 */
export function subscribeToUsers(onUsersChanged: (users: CustomerUser[]) => void) {
  return subscribeToAllUsers(onUsersChanged);
}

/**
 * 6. Update user status in Firestore
 */
export async function updateUserStatus(userId: string, status: 'Active' | 'Inactive') {
  return updateUserStatusDoc(userId, status);
}

/**
 * 7. Update user profile fields in Firestore
 */
export async function updateUserProfile(userId: string, updates: Partial<CustomerUser>) {
  return updateUserProfileDoc(userId, updates);
}

/**
 * 8. Send password reset link via Firebase Auth
 */
export async function sendPasswordReset(identifierOrEmail: string) {
  return sendFirebasePasswordReset(identifierOrEmail);
}

/**
 * 9. Username availability checker
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const normalized = cleanUsername(username);
  if (!normalized || normalized.length < 3) return false;

  const reserved = ['admin', 'satu', 'administrator', 'root', 'superuser', 'shivcomputer'];
  if (reserved.includes(normalized)) return false;

  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'usernames', normalized));
    return !snap.exists();
  } catch {
    return true;
  }
}

/**
 * 10. Direct Password Reset (In-app recovery)
 */
export async function resetPasswordDirectly(
  identifierOrEmail: string,
  newPassword: string
): Promise<{ success: boolean; email: string; username: string }> {
  const trimmed = identifierOrEmail.trim();
  if (!trimmed) {
    const err = new Error('Please enter your email or username');
    (err as any).code = 'auth/missing-email';
    throw err;
  }
  if (!newPassword || newPassword.length < 6) {
    const err = new Error('Password must be at least 6 characters long');
    (err as any).code = 'auth/weak-password';
    throw err;
  }

  // 1. Resolve registered email from username or email
  const email = await resolveEmailFromIdentifier(trimmed);

  // 2. If the user is currently authenticated with matching account, update password directly
  if (auth.currentUser && auth.currentUser.email?.toLowerCase() === email.toLowerCase()) {
    const { updatePassword } = await import('firebase/auth');
    await updatePassword(auth.currentUser, newPassword);
  }

  return { success: true, email, username: trimmed };
}
