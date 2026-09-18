import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Send,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Eye,
  EyeOff,
  HelpCircle,
} from 'lucide-react';
import { TranslationStrings, LanguageCode } from '../types';
import { sendPasswordReset, resetPasswordDirectly } from '../lib/firebase';

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
  // Mode: 'email' (Firebase Auth email dispatch) or 'direct' (Instant password reset)
  const [activeTab, setActiveTab] = useState<'email' | 'direct'>('email');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email recovery response state
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [directResetUrl, setDirectResetUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Direct reset form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [instantSuccess, setInstantSuccess] = useState(false);

  // Sync initial identifier when modal opens
  useEffect(() => {
    if (isOpen) {
      setIdentifier(initialIdentifier || '');
      setErrorMessage(null);
      setSuccessEmail(null);
      setDirectResetUrl(null);
      setCopiedLink(false);
      setNewPassword('');
      setConfirmPassword('');
      setInstantSuccess(false);
      setIsLoading(false);
      setActiveTab('email');
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
        return 'કૃપા કરીને માન્ય ઈમેલ સરનામું દાખલ કરો (દા.ત. rahul@gmail.com).';
      }
      if (language === 'hi') {
        return 'कृपया एक वैध ईमेल पता दर्ज करें (उदा. rahul@gmail.com)।';
      }
      return 'Please enter a valid email address (e.g. rahul@gmail.com).';
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

    if (code === 'auth/too-many-requests') {
      if (language === 'gu') {
        return 'ઘણા બધા પાસવર્ડ રીસેટ પ્રયાસો થયા છે. સુરક્ષા કારણોસર થોડીવાર પછી ફરી પ્રયાસ કરો.';
      }
      if (language === 'hi') {
        return 'बहुत सारे पासवर्ड रीसेट प्रयास किए गए हैं। सुरक्षा कारणों से कुछ देर बाद पुनः प्रयास करें।';
      }
      return 'Too many reset requests. Please wait a few minutes before trying again for security.';
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

    return msg || (language === 'gu' ? 'પાસવર્ડ રીસેટ કરવામાં સમસ્યા આવી.' : 'An error occurred while resetting password.');
  };

  // 1. Submit Firebase Auth email reset
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMessage(
        language === 'gu'
          ? 'કૃપા કરીને તમારો ઈમેલ અથવા યુઝરનેમ દાખલ કરો.'
          : language === 'hi'
          ? 'कृपया अपना ईमेल या यूज़रनेम दर्ज करें।'
          : 'Please enter your registered email address or username.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const result = await sendPasswordReset(trimmed);
      setSuccessEmail(result.email);
      setDirectResetUrl(result.directResetUrl);
    } catch (err: any) {
      setErrorMessage(getLocalizedErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Resend email link
  const handleResend = async () => {
    if (!successEmail) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await sendPasswordReset(successEmail);
      setDirectResetUrl(res.directResetUrl);
    } catch (err: any) {
      setErrorMessage(getLocalizedErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Copy direct reset link
  const handleCopyLink = () => {
    if (!directResetUrl) return;
    navigator.clipboard.writeText(directResetUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  // 4. Submit instant in-app password reset
  const handleDirectPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmed = identifier.trim();
    if (!trimmed) {
      setErrorMessage(
        language === 'gu'
          ? 'કૃપા કરીને તમારો ઈમેલ અથવા યુઝરનેમ દાખલ કરો.'
          : language === 'hi'
          ? 'कृपया अपना ईमेल या यूज़रनेम दर्ज करें।'
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <ShieldCheck className="w-3 h-3" />
                Firebase
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {strings.subtitle}
            </p>
          </div>
        </div>

        {/* Tab switchers: Email Link vs Direct Reset (Only if not already success) */}
        {!successEmail && !instantSuccess && (
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-5">
            <button
              type="button"
              id="forgot-password-tab-email"
              onClick={() => {
                setActiveTab('email');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'email'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{strings.emailLinkTab}</span>
            </button>
            <button
              type="button"
              id="forgot-password-tab-direct"
              onClick={() => {
                setActiveTab('direct');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'direct'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{strings.instantResetTab}</span>
            </button>
          </div>
        )}

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

        {/* ========================================================================= */}
        {/* STATE 1: INSTANT SUCCESS (PASSWORD UPDATED DIRECTLY)                      */}
        {/* ========================================================================= */}
        {instantSuccess && (
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
        )}

        {/* ========================================================================= */}
        {/* STATE 2: EMAIL SENT SUCCESS VIEW (WITH DIRECT RESET LINK & INSTANT RESET) */}
        {/* ========================================================================= */}
        {successEmail && !instantSuccess && (
          <motion.div
            id="forgot-password-success-view"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                    {strings.successTitle}
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                    {strings.successMsg}
                  </p>
                  <div
                    id="recovery-dispatched-email-chip"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-slate-900 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 border border-emerald-300 dark:border-emerald-700"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{successEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DIRECT ACTION LINK (Specifically solves "email in not show the reset link") */}
            <div
              id="direct-reset-link-container"
              className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2.5"
            >
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
                <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-xs font-bold">{strings.directLinkTitle}</span>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
                {strings.directLinkDesc}
              </p>

              {directResetUrl && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <input
                    type="text"
                    readOnly
                    id="direct-reset-url-input"
                    value={directResetUrl}
                    className="flex-1 px-3 py-2 text-[11px] font-mono rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 select-all"
                  />
                  <button
                    type="button"
                    id="copy-direct-reset-link-btn"
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shrink-0"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>{strings.linkCopied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{strings.copyLink}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Instant password reset alternative button */}
              <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">
                  {language === 'gu'
                    ? 'ઇમેઇલમાં લિંક નથી દેખાતી? સીધો પાસવર્ડ સેટ કરો:'
                    : language === 'hi'
                    ? 'ईमेल में लिंक दिखाई नहीं दे रहा? सीधा पासवर्ड सेट करें:'
                    : 'Email not showing the reset link? Set password directly:'}
                </span>
                <button
                  type="button"
                  id="switch-to-direct-reset-btn"
                  onClick={() => {
                    setSuccessEmail(null);
                    setActiveTab('direct');
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 ml-2"
                >
                  <Lock className="w-3 h-3" />
                  <span>{strings.instantResetTab}</span>
                </button>
              </div>
            </div>

            {/* Inbox Notice & Troubleshooting */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {strings.checkInboxNote}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'gu'
                  ? 'ફાયરબેઝ ઈમેલ સામાન્ય રીતે noreply@famous-valor-7f38q.firebaseapp.com પરથી આવે છે. જો ઈનબોક્સમાં ન દેખાય તો કૃપા કરીને Spam / Junk ફોલ્ડર પણ તપાસો.'
                  : language === 'hi'
                  ? 'फायरबेस ईमेल आमतौर पर noreply@famous-valor-7f38q.firebaseapp.com से आता है। यदि इनबॉक्स में न दिखे तो कृपया Spam / Junk फ़ोल्डर भी देखें।'
                  : 'Firebase Auth emails are dispatched from noreply@famous-valor-7f38q.firebaseapp.com. If not in Primary inbox, please check your Spam/Junk folder.'}
              </p>
            </div>

            {/* Actions on Success */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                id="forgot-password-resend-btn"
                onClick={handleResend}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>{strings.resendLink}</span>
              </button>

              <button
                type="button"
                id="forgot-password-back-login-btn"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-md shadow-blue-500/20"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{strings.backToLogin}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* STATE 3A: EMAIL RESET FORM (FIREBASE AUTH)                                */}
        {/* ========================================================================= */}
        {!successEmail && !instantSuccess && activeTab === 'email' && (
          <form id="forgot-password-email-form" onSubmit={handleEmailSubmit} className="space-y-4">
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
                  type="text"
                  id="forgot-password-email-input"
                  name="recoveryIdentifier"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={strings.inputPlaceholder}
                  autoFocus
                  disabled={isLoading}
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>
              <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  {language === 'gu'
                    ? 'તમે ઈમેલ અથવા યુઝરનેમ (દા.ત. rahul અથવા satu) લખી શકો છો. સિસ્ટમ આપોઆપ તમારું રજિસ્ટર્ડ ઈમેલ શોધી લેશે.'
                    : language === 'hi'
                    ? 'आप ईमेल या यूज़रनेम (उदा. rahul या satu) लिख सकते हैं। सिस्टम स्वचालित रूप से आपका पंजीकृत ईमेल ढूंढ लेगा।'
                    : 'You can enter your email or username (e.g. rahul or satu). The portal automatically maps to your registered account.'}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                id="forgot-password-switch-to-direct"
                onClick={() => setActiveTab('direct')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {strings.instantResetTab} →
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  id="forgot-password-cancel-btn"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {strings.cancel}
                </button>

                <button
                  type="submit"
                  id="forgot-password-submit-btn"
                  disabled={isLoading || !identifier.trim()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STATE 3B: INSTANT IN-APP PASSWORD RESET (SOLVES "EMAIL NOT SHOWING LINK") */}
        {/* ========================================================================= */}
        {!successEmail && !instantSuccess && activeTab === 'direct' && (
          <form id="forgot-password-direct-form" onSubmit={handleDirectPasswordReset} className="space-y-3.5">
            {/* Account Identifier */}
            <div className="space-y-1">
              <label
                htmlFor="direct-reset-identifier-input"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {strings.inputLabel}
              </label>
              <input
                type="text"
                id="direct-reset-identifier-input"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={strings.inputPlaceholder}
                disabled={isLoading}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label
                htmlFor="direct-reset-new-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {strings.newPasswordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="direct-reset-new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="At least 6 characters"
                  disabled={isLoading}
                  className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label
                htmlFor="direct-reset-confirm-password"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                {strings.confirmPasswordLabel}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="direct-reset-confirm-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Re-enter new password"
                disabled={isLoading}
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                id="direct-reset-switch-to-email"
                onClick={() => setActiveTab('email')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← {strings.emailLinkTab}
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  id="direct-reset-cancel-btn"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {strings.cancel}
                </button>

                <button
                  type="submit"
                  id="direct-reset-submit-btn"
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
                      <span>{strings.updatePasswordBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
