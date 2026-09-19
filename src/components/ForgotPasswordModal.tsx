import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  KeyRound,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  HelpCircle,
} from 'lucide-react';
import { TranslationStrings, LanguageCode } from '../types';
import { resetPasswordDirectly } from '../lib/firebase';

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
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [instantSuccess, setInstantSuccess] = useState(false);

  // Sync initial identifier when modal opens
  useEffect(() => {
    if (isOpen) {
      setIdentifier(initialIdentifier || '');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setErrorMessage(null);
      setInstantSuccess(false);
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

  // Format Firebase Auth errors into localized, helpful messages
  const getLocalizedErrorMessage = (err: any): string => {
    const code = err?.code || '';
    const msg = err?.message || '';

    if (code === 'auth/user-not-found') {
      if (language === 'gu') {
        return 'આ ઈમેલ અથવા યુઝરનેમ સાથે કોઈ ખાતું મળ્યું નથી. કૃપા કરીને સ્પેલિંગ તપાસો.';
      }
      if (language === 'hi') {
        return 'इस ईमेल या यूज़रनेम के साथ कोई खाता नहीं मिला। कृपया वर्तनी जांचें।';
      }
      return 'No account found with this email or username. Please check your spelling.';
    }

    if (code === 'auth/invalid-email') {
      if (language === 'gu') {
        return 'કૃપા કરીને માન્ય ઈમેલ સરનામું દાખલ કરો.';
      }
      if (language === 'hi') {
        return 'कृपया एक वैध ईमेल पता दर्ज करें।';
      }
      return 'Please enter a valid email address.';
    }

    if (code === 'auth/missing-email') {
      if (language === 'gu') {
        return 'કૃપા કરીને તમારો નોંધાયેલ ઈમેલ અથવા યુઝરનેમ દાખલ કરો.';
      }
      if (language === 'hi') {
        return 'कृपया अपना पंजीकृत ईमेल या यूज़रनेम दर्ज करें।';
      }
      return 'Please enter your registered email address or username.';
    }

    if (code === 'auth/weak-password') {
      if (language === 'gu') {
        return 'પાસવર્ડ ઓછામાં ઓછા 6 અક્ષરોનો હોવો જોઈએ.';
      }
      if (language === 'hi') {
        return 'पासवर्ड कम से कम 6 वर्णों का होना चाहिए।';
      }
      return 'Password must be at least 6 characters long.';
    }

    if (code === 'auth/network-request-failed') {
      if (language === 'gu') {
        return 'નેટવર્ક કનેક્શન સમસ્યા. કૃપા કરીને તમારું ઇન્ટરનેટ કનેક્શન તપાસો.';
      }
      if (language === 'hi') {
        return 'नेटवर्क कनेक्शन समस्या। कृपया अपना इंटरनेट कनेक्शन जांचें।';
      }
      return 'Network connection problem. Please verify your internet connection.';
    }

    return msg || (language === 'gu' ? 'પાસવર્ડ સેટ કરવામાં સમસ્યા આવી.' : 'An error occurred while setting password.');
  };

  // Submit direct password reset
  const handleDirectPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMessage(
        language === 'gu'
          ? 'કૃપા કરીને તમારો નોંધાયેલ ઈમેલ અથવા યુઝરનેમ દાખલ કરો.'
          : language === 'hi'
          ? 'कृपया अपना पंजीकृत ईमेल या यूज़रनेम दर्ज करें।'
          : 'Please enter your registered email address or username.'
      );
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage(
        language === 'gu'
          ? 'પાસવર્ડ ઓછામાં ઓછા 6 અક્ષરોનો હોવો જોઈએ.'
          : language === 'hi'
          ? 'पासवर्ड कम से कम 6 वर्णों का होना चाहिए।'
          : 'New password must be at least 6 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        language === 'gu'
          ? 'બંને પાસવર્ડ મેળ ખાતા નથી.'
          : language === 'hi'
          ? 'दोनों पासवर्ड मेल नहीं खाते।'
          : 'Passwords do not match. Please verify.'
      );
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordDirectly(trimmed, newPassword);
      setInstantSuccess(true);
    } catch (err: any) {
      setErrorMessage(getLocalizedErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const getSetPasswordBtnText = () => {
    if (language === 'gu') return 'સીધો પાસવર્ડ સેટ કરો';
    if (language === 'hi') return 'सीधा पासवर्ड सेट करें';
    return 'Set Password Directly';
  };

  return (
    <div
      id="forgot-password-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-modal-title"
    >
      <motion.div
        id="forgot-password-modal-card"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-7 relative text-slate-900 dark:text-white my-6"
      >
        {/* Close button */}
        <button
          type="button"
          id="forgot-password-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="pr-6">
            <div className="flex items-center gap-2">
              <h3
                id="forgot-password-modal-title"
                className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white"
              >
                {strings.title}
              </h3>
              <span
                id="forgot-password-firebase-badge"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                <ShieldCheck className="w-3 h-3" />
                Firebase
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {strings.subtitle}
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <motion.div
            id="forgot-password-error-alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 flex items-start gap-2.5 text-xs sm:text-sm"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </motion.div>
        )}

        {/* State: Instant Success */}
        {instantSuccess ? (
          <motion.div
            id="forgot-password-instant-success-view"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    {strings.instantSuccessTitle}
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                    {strings.instantSuccessMsg}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                id="forgot-password-instant-login-btn"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-md shadow-blue-500/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{strings.backToLogin}</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Form: Set Password Directly */
          <form id="forgot-password-direct-form" onSubmit={handleDirectPasswordReset} className="space-y-4">
            {/* Registered Email or Username field */}
            <div className="space-y-1.5">
              <label
                htmlFor="forgot-password-identifier-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {strings.inputLabel}
              </label>
              <input
                type="text"
                id="forgot-password-identifier-input"
                name="identifier"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={strings.inputPlaceholder}
                autoFocus
                disabled={isLoading}
                autoComplete="username"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
              />
              <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  {language === 'gu'
                    ? 'તમે તમારો રજિસ્ટર્ડ ઈમેલ અથવા યુઝરનેમ (દા.ત. rahul અથવા satu) લખી શકો છો.'
                    : language === 'hi'
                    ? 'आप अपना पंजीकृत ईमेल या यूज़रनेम (उदा. rahul या satu) लिख सकते हैं।'
                    : 'You can enter your registered email address or username (e.g. rahul or satu).'}
                </span>
              </div>
            </div>

            {/* New Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="forgot-password-new-password-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {strings.newPasswordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="forgot-password-new-password-input"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="At least 6 characters"
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  id="forgot-password-toggle-new-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="forgot-password-confirm-password-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {strings.confirmPasswordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="forgot-password-confirm-password-input"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Re-enter new password"
                  disabled={isLoading}
                  autoComplete="new-password"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                />
                <button
                  type="button"
                  id="forgot-password-toggle-confirm-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions: Cancel and Set Password Directly */}
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
                disabled={isLoading || !identifier.trim() || !newPassword || !confirmPassword}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{strings.updating}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>{getSetPasswordBtnText()}</span>
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
