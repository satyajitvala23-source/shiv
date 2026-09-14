import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { LoginRole, TranslationStrings } from '../types';
import { BrandLogo } from './BrandLogo';

interface LoginFormProps {
  role: LoginRole;
  t: TranslationStrings;
  onForgotPasswordClick: () => void;
  onBackToHomeClick: () => void;
  onLoginSuccess?: (role: LoginRole) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  role,
  t,
  onForgotPasswordClick,
  onBackToHomeClick,
  onLoginSuccess,
}) => {
  // Form values
  const [username, setUsername] = useState(role === 'admin' ? 'admin' : 'ramesh@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // States for validation and loading
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    text: string;
  } | null>(null);

  // When role changes, switch default sample username if untouched
  React.useEffect(() => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('ramesh@gmail.com');
      setPassword('user123');
    }
  }, [role]);

  // Handle form submission with pure frontend validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    const newErrors: { identifier?: string; password?: string } = {};

    // Validate identifier (username or user email/username)
    if (!username.trim()) {
      newErrors.identifier =
        role === 'admin'
          ? t.errors.usernameRequired
          : t.errors.emailOrUsernameRequired;
    }

    // Validate password
    if (!password) {
      newErrors.password = t.errors.passwordRequired;
    } else if (password.length < 4) {
      newErrors.password = t.errors.passwordTooShort;
    }

    setErrors(newErrors);

    // If validation fails, stop
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Show loading effect
    setIsLoading(true);

    // Simulate verification delay (approx 0.7 seconds)
    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage({
        type: 'success',
        title: t.simulations.loginSuccessTitle,
        text: t.simulations.loginSuccessMsg,
      });

      // Trigger navigation to selected role dashboard
      if (onLoginSuccess) {
        onLoginSuccess(role);
      }
    }, 700);
  };

  // Clear errors when field changes
  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (errors.identifier) {
      setErrors((prev) => ({ ...prev, identifier: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      {/* Centered Card Container */}
      <motion.div
        id="login-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-300/40 p-6 sm:p-9"
      >
        {/* Shiv Computer Branding */}
        <BrandLogo brandName={t.brandName} tagline={t.brandTagline} />

        {/* Dynamic Heading & Subtitle based on selected Role */}
        <div className="mt-6 mb-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <div
                id={`role-indicator-badge-${role}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2.5 ${
                  role === 'admin'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                }`}
              >
                {role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                )}
                <span>{role === 'admin' ? t.adminBadge : t.userBadge}</span>
              </div>

              <h2
                id="login-heading"
                className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
              >
                {role === 'admin' ? t.adminHeading : t.userHeading}
              </h2>
              <p
                id="login-subtitle"
                className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs"
              >
                {role === 'admin' ? t.adminSubtitle : t.userSubtitle}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Global Feedback Banner */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              id="form-status-banner"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50/90 border-rose-200 text-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{statusMessage.title}</div>
                <div className="text-xs mt-0.5 text-slate-600">{statusMessage.text}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Login Form */}
        <form id="login-form" onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* USERNAME OR USER EMAIL/USERNAME INPUT */}
          <div>
            <label
              htmlFor="login-identifier-input"
              className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5"
            >
              {role === 'admin' ? t.adminUsernameLabel : t.userIdentifierLabel}
            </label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                {role === 'admin' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </div>
              <input
                id="login-identifier-input"
                name="identifier"
                type={role === 'admin' ? 'text' : 'text'}
                autoComplete={role === 'admin' ? 'username' : 'email'}
                value={username}
                onChange={handleIdentifierChange}
                placeholder={
                  role === 'admin'
                    ? t.adminUsernamePlaceholder
                    : t.userIdentifierPlaceholder
                }
                disabled={isLoading}
                aria-invalid={Boolean(errors.identifier)}
                aria-describedby={errors.identifier ? 'identifier-error-msg' : undefined}
                className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white border text-xs sm:text-sm text-slate-900 rounded-xl transition-all duration-200 outline-none ${
                  errors.identifier
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15 bg-rose-50/20'
                    : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
                }`}
              />
            </div>
            {errors.identifier && (
              <p
                id="identifier-error-msg"
                className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium animate-in fade-in"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.identifier}</span>
              </p>
            )}
          </div>

          {/* PASSWORD INPUT WITH SHOW/HIDE */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password-input"
                className="block text-xs sm:text-sm font-semibold text-slate-700"
              >
                {t.passwordLabel}
              </label>
            </div>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password-input"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                placeholder={t.passwordPlaceholder}
                disabled={isLoading}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error-msg' : undefined}
                className={`w-full pl-10 pr-11 py-2.5 sm:py-3 bg-white border text-xs sm:text-sm text-slate-900 rounded-xl transition-all duration-200 outline-none ${
                  errors.password
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15 bg-rose-50/20'
                    : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
                }`}
              />
              <button
                type="button"
                id="toggle-password-visibility-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? t.hidePassword : t.showPassword}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error-msg"
                className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium animate-in fade-in"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}
          </div>

          {/* REMEMBER ME & FORGOT PASSWORD */}
          <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
            <label
              htmlFor="remember-me-checkbox"
              className="inline-flex items-center gap-2 cursor-pointer select-none"
            >
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0 transition-colors cursor-pointer"
              />
              <span className="text-slate-600 font-medium">{t.rememberMe}</span>
            </label>

            <button
              type="button"
              id="forgot-password-link"
              onClick={onForgotPasswordClick}
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              {t.forgotPassword}
            </button>
          </div>

          {/* LOGIN BUTTON WITH LOADING EFFECT */}
          <div className="pt-2">
            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-md ${
                role === 'admin'
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-500/25'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-500/25'
              } ${isLoading ? 'opacity-85 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.loggingIn}</span>
                </>
              ) : (
                <span>{t.loginButton}</span>
              )}
            </button>
          </div>

          {/* BACK TO HOME LINK */}
          <div className="pt-2 text-center">
            <button
              type="button"
              id="back-to-home-button"
              onClick={onBackToHomeClick}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors py-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backToHome}</span>
            </button>
          </div>

          {/* Quick Demo Credentials Reminder */}
          <div className="pt-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Demo Login:</span>
              <span className="font-mono font-medium text-slate-700">
                {role === 'admin' ? 'admin / admin123' : 'ramesh@gmail.com / user123'}
              </span>
            </div>
          </div>
        </form>

        {/* Security / Encryption Sub-footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span>{t.securityNote}</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
