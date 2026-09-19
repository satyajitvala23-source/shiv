/**
 * ============================================================================
 * SHIV COMPUTER - CITIZEN / USER OPERATIONS (Project: "Shiv-ori")
 * ============================================================================
 * 
 * Provides citizen user operations:
 * - Submitting new service applications into "form_submissions"
 * - Listening to own submissions in real time
 * - Updating profile details
 * 
 * Strict User Privacy:
 * - Citizens only query and listen to their own documents where userId === uid
 */

import {
  createFormSubmission,
  subscribeToUserSubmissions,
  updateUserProfileDoc,
  CreateSubmissionParams,
} from './firestore';
import { CustomerUser, FormSubmission } from '../types';

export const userOperations = {
  // Listen to current user's submitted forms
  subscribeMySubmissions: (
    userId: string,
    callback: (submissions: FormSubmission[]) => void
  ) => {
    return subscribeToUserSubmissions(userId, callback);
  },

  // Submit a new application form
  submitForm: async (params: CreateSubmissionParams) => {
    return createFormSubmission(params);
  },

  // Update own profile
  updateProfile: async (userId: string, updates: Partial<CustomerUser>) => {
    return updateUserProfileDoc(userId, updates);
  },
};

export default userOperations;
