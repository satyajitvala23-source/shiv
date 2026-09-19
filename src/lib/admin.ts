/**
 * ============================================================================
 * SHIV COMPUTER - ADMIN OPERATIONS (Project: "Shiv-ori")
 * ============================================================================
 * 
 * Provides administrative controls for the Shiv Computer Admin Panel:
 * - Real-time listeners for all form submissions and registered users
 * - Updating submission status (Pending -> Processing -> Completed / Rejected)
 * - Deleting submissions
 * - Updating user account status (Active / Inactive)
 * - Updating global website settings in Firestore
 */

import {
  subscribeToAllSubmissions,
  subscribeToAllUsers,
  updateSubmissionStatusDoc,
  deleteSubmissionDoc,
  updateUserStatusDoc,
  deleteUserDoc,
  saveWebsiteSettingsDoc,
  subscribeToWebsiteSettings,
} from './firestore';
import { FormSubmission, CustomerUser, WebsiteContent } from '../types';

export const adminOperations = {
  // Listeners
  subscribeSubmissions: subscribeToAllSubmissions,
  subscribeUsers: subscribeToAllUsers,
  subscribeSettings: subscribeToWebsiteSettings,

  // Submission controls
  updateStatus: async (submissionId: string, status: string, notes?: string) => {
    return updateSubmissionStatusDoc(submissionId, status, notes);
  },
  deleteSubmission: async (submissionId: string) => {
    return deleteSubmissionDoc(submissionId);
  },

  // User management
  setUserStatus: async (userId: string, status: 'Active' | 'Inactive') => {
    return updateUserStatusDoc(userId, status);
  },
  deleteUser: async (userId: string) => {
    return deleteUserDoc(userId);
  },

  // Global settings
  saveSettings: async (settings: Partial<WebsiteContent>) => {
    return saveWebsiteSettingsDoc(settings);
  },
};

export default adminOperations;
