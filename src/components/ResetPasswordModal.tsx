import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowRight,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { TranslationStrings, LanguageCode } from '../types';
import { verifyPasswordResetToken, completePasswordReset, formatLocalizedAuthError } from '../lib/auth';

interface ResetPasswordModalProps {
  isOpen: boolean;
  oobCode: string;
  onClose: () => void;
  onSuccessLogin: () => void;
  onRequestNewLink: () => void;
  language: LanguageCode;
  t: TranslationStrings;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  oobCode,
  onClose,
  onSuccessLogin,
  onRequestNewLink,
  language,
  t,
}) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  // Strings fallback helper
  const modalStrings = t.resetPasswordModal || {
    title: 'Create New Password',
    subtitle: 'Enter a new secure password for your registered account.',
    verifying: 'Verifying your password reset link with Firebase...',
    emailLabel: 'Account Email',
    newPasswordLabel: 'New Password',
    newPasswordPlaceholder: 'At least 6 characters',
    confirmPasswordLabel: 'Confirm New Password',
    confirmPasswordPlaceholder: 'Re-enter your new password',
    submitBtn: 'Set New Password',
    submitting: 'Updating password securely...',
    successExact: 'Password reset successfully. You can now log in with your new password.',
    loginBtn: 'Log In Now',
    invalidLinkTitle: 'Invalid or Expired Link',
    invalidLinkDesc: 'This password reset link is invalid or has already expired. Please request a new password reset email.',
    requestNewBtn: 'Request New Reset Link',
  };

  // Verify the oobCode with Firebase Auth on mount or when oobCode changes
  useEffect(() => {
    let isCancelled = false;

    async function checkCode() {
      if (!isOpen || !oobCode) return;

      setIsVerifying(true);
      setVerifyError(null);
      setSubmitError(null);
      setIsResetSuccess(false);

      try {
        const email = await verifyPasswordResetToken(oobCode);
        if (!isCancelled) {
          setVerifiedEmail(email);
          setIsVerifying(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setVerifyError(formatLocalizedAuthError(err, language));
          setIsVerifying(false);
        }
      }
    }

    checkCode();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, oobCode, language]);

  // Clean URL parameters when successfully reset or closed
  const cleanupUrlParams = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('mode');
      url.searchParams.delete('oobCode');
      url.searchParams.delete('apiKey');
      url.searchParams.delete('lang');
      window.history.replaceState({}, document.title, url.pathname + url.hash);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!newPassword || newPassword.length < 6) {
      setSubmitError(
        language === 'gu'
          ? 'પાસવર્ડ ઓછામાં ઓછા 6 અક્ષરોનો હોવો જોઈએ.'
          : 'Password must be at least 6 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError(
        language === 'gu'
          ? 'બંને પાસવર્ડ મેળ ખાતા નથી.'
          : 'Passwords do not match. Please re-enter.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await completePasswordReset(oobCode, newPassword);
      setIsResetSuccess(true);
      cleanupUrlParams();
    } catch (err: any) {
      setSubmitError(formatLocalizedAuthError(err, language));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginClick = () => {
    cleanupUrlParams();
    onSuccessLogin();
  };

  return (
    <div
      id="reset-password-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-modal-title"
    >
      <motion.div
        id="reset-password-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-800/80 shadow-2xl p-6 sm:p-7 relative text-slate-900 dark:text-white my-6"
      >
        {/* Close Button */}
        <button
          type="button"
          id="reset-password-close-btn"
          onClick={() => {
            cleanupUrlParams();
            onClose();
          }}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                id="reset-password-modal-title"
                className="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
              >
                {modalStrings.title}
              </h3>
              <span
                id="reset-password-firebase-badge"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100/80 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
              >
                <ShieldCheck className="w-3 h-3" />
                Firebase Auth
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {modalStrings.subtitle}
            </p>
          </div>
        </div>

        {/* State 1: Verifying link with Firebase */}
        {isVerifying ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {modalStrings.verifying}
            </p>
          </div>
        ) : verifyError ? (
          /* State 2: Invalid or expired action code */
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-100">
                    {modalStrings.invalidLinkTitle}
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    {verifyError}
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/80 pt-1">
                    {modalStrings.invalidLinkDesc}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                id="reset-password-invalid-cancel-btn"
                onClick={() => {
                  cleanupUrlParams();
                  onClose();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t.common.cancel}
              </button>

              <button
                type="button"
                id="reset-password-request-new-btn"
                onClick={() => {
                  cleanupUrlParams();
                  onRequestNewLink();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{modalStrings.requestNewBtn}</span>
              </button>
            </div>
          </motion.div>
        ) : isResetSuccess ? (
          /* State 3: Password Reset Successfully */
          <motion.div
            id="reset-password-success-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100">
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                    {language === 'gu'
                      ? 'પાસવર્ડ સફળતાપૂર્વક રીસેટ થયો'
                      : 'Password Reset Successfully'}
                  </h4>
                  {/* Exact message required: “Password reset successfully. You can now log in with your new password.” */}
                  <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium leading-relaxed">
                    {language === 'gu'
                      ? 'પાસવર્ડ સફળતાપૂર્વક રીસેટ થયો. હવે તમે તમારા નવા પાસવર્ડ સાથે લૉગ ઇન કરી શકો છો.'
                      : 'Password reset successfully. You can now log in with your new password.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                id="reset-password-login-now-btn"
                onClick={handleLoginClick}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/25"
              >
                <span>{modalStrings.loginBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* State 4: Set New Password Form */
          <form id="reset-password-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Display Verified Account Email */}
            {verifiedEmail && (
              <div className="p-3 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {modalStrings.emailLabel}:
                </span>
                <span className="font-semibold text-slate-900 dark:text-white truncate">
                  {verifiedEmail}
                </span>
              </div>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 flex items-start gap-2 text-xs sm:text-sm"
                >
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-snug flex-1">{submitError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* New Password Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="reset-new-password-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {modalStrings.newPasswordLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reset-new-password-input"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  placeholder={modalStrings.newPasswordPlaceholder}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  id="reset-toggle-new-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="reset-confirm-password-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {modalStrings.confirmPasswordLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="reset-confirm-password-input"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (submitError) setSubmitError(null);
                  }}
                  placeholder={modalStrings.confirmPasswordPlaceholder}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  id="reset-toggle-confirm-password-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="reset-password-cancel-form-btn"
                onClick={() => {
                  cleanupUrlParams();
                  onClose();
                }}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {t.common.cancel}
              </button>

              <button
                type="submit"
                id="reset-password-submit-btn"
                disabled={isSubmitting || !newPassword || !confirmPassword}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{modalStrings.submitting}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{modalStrings.submitBtn}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
