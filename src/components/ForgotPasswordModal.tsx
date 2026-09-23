import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Send,
  RefreshCw,
} from 'lucide-react';
import { TranslationStrings, LanguageCode } from '../types';
import { sendFirebasePasswordResetEmail, formatLocalizedAuthError } from '../lib/auth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIdentifier?: string;
  language: LanguageCode;
  t: TranslationStrings;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialIdentifier = '',
  language,
  t,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  // Sync initial identifier when modal opens (prefill if it's an email or username)
  useEffect(() => {
    if (isOpen) {
      // If initialIdentifier has '@', use it directly; otherwise keep it clean
      setEmail(initialIdentifier.trim());
      setErrorMessage(null);
      setSuccessEmail(null);
      setIsLoading(false);
    }
  }, [isOpen, initialIdentifier]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const strings = t.forgotPasswordModal;

  // Submit password reset request via Firebase Authentication
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setErrorMessage(
        language === 'gu'
          ? 'કૃપા કરીને તમારું નોંધાયેલ ઈમેલ સરનામું દાખલ કરો.'
          : 'Please enter your registered email address.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await sendFirebasePasswordResetEmail(trimmed);
      setSuccessEmail(res.email);
    } catch (err: any) {
      setErrorMessage(formatLocalizedAuthError(err, language));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAnother = () => {
    setSuccessEmail(null);
    setErrorMessage(null);
  };

  return (
    <div
      id="forgot-password-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-modal-title"
    >
      <motion.div
        id="forgot-password-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="w-full max-w-md rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-800/80 shadow-2xl p-6 sm:p-7 relative text-slate-900 dark:text-white my-6"
      >
        {/* Close button */}
        <button
          type="button"
          id="forgot-password-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div className="pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                id="forgot-password-modal-title"
                className="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
              >
                {strings.title}
              </h3>
              <span
                id="forgot-password-firebase-badge"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100/80 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                <ShieldCheck className="w-3 h-3" />
                Firebase Auth
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {strings.subtitle}
            </p>
          </div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              id="forgot-password-error-alert"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              className="mb-4 p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 flex items-start gap-2.5 text-xs sm:text-sm"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-snug flex-1">{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* State: Success View */}
        {successEmail ? (
          <motion.div
            id="forgot-password-success-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    {strings.successTitle}
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    {strings.successMsg}
                  </p>
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-emerald-300 dark:border-emerald-700 font-mono text-xs font-semibold text-emerald-900 dark:text-emerald-200 break-all">
                    {successEmail}
                  </div>
                  <p className="text-[11px] text-emerald-700/90 dark:text-emerald-300/80 pt-1 leading-relaxed">
                    {strings.checkInboxNote}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                id="forgot-password-resend-btn"
                onClick={handleResetAnother}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{strings.resendLink}</span>
              </button>

              <button
                type="button"
                id="forgot-password-back-login-btn"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{strings.backToLogin}</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Form: Simple Email Input */
          <form
            id="forgot-password-email-form"
            onSubmit={handleSendResetEmail}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="forgot-password-email-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {strings.inputLabel}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="forgot-password-email-input"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={strings.inputPlaceholder}
                  autoFocus
                  disabled={isLoading}
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 leading-relaxed">
                {language === 'gu'
                  ? 'તમારા ફાયરબેઝ એકાઉન્ટમાં નોંધાયેલ ઈમેલ દાખલ કરો.'
                  : 'Enter the email address registered with your Shiv Computer account in Firebase.'}
              </p>
            </div>

            {/* Actions: Cancel & Send Reset Link */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="forgot-password-cancel-btn"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {strings.cancel}
              </button>

              <button
                type="submit"
                id="forgot-password-submit-btn"
                disabled={isLoading || !email.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{strings.sending}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{strings.sendButton}</span>
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
