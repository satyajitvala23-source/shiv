import React, { useState, useEffect } from 'react';
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
  AtSign,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { LoginRole, TranslationStrings } from '../types';
import { BrandLogo } from './BrandLogo';
import { useApp } from '../context/AppContext';

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
  const { loginWithCredentials, registerNewUser, language } = useApp();

  // Mode: 'login' | 'register' (Registration is available for citizens/users)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form Values
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form Values
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    title: string;
    text: string;
  } | null>(null);

  // When role changes, if Admin is selected, switch mode to 'login'
  useEffect(() => {
    if (role === 'admin') {
      setAuthMode('login');
      setIdentifier('satu');
      setLoginPassword('');
    } else {
      setIdentifier('');
      setLoginPassword('');
    }
    setErrors({});
    setStatusMessage(null);
  }, [role]);

  // Error message helper based on Firebase error code or custom error
  const getErrorMessage = (err: any): { title: string; text: string } => {
    const code = err?.code || err?.message;

    if (code === 'USERNAME_ALREADY_EXISTS') {
      return {
        title: language === 'gu' ? 'યુઝરનેમ ઉપલબ્ધ નથી' : 'Username Taken',
        text: t.errors.usernameTaken,
      };
    }
    if (code === 'USERNAME_TOO_SHORT') {
      return {
        title: language === 'gu' ? 'અમાન્ય યુઝરનેમ' : 'Invalid Username',
        text: t.errors.usernameInvalid,
      };
    }
    if (code === 'USER_NOT_FOUND' || code === 'auth/user-not-found') {
      return {
        title: language === 'gu' ? 'ખાતું મળ્યું નથી' : 'Account Not Found',
        text: language === 'gu'
          ? 'આ યુઝરનેમ અથવા ઈમેલ ધરાવતું કોઈ ખાતું મળ્યું નથી.'
          : 'No account found with this username or email address.',
      };
    }
    if (code === 'ADMIN_ACCESS_DENIED') {
      return {
        title: language === 'gu' ? 'એડમિન પરવાનગી નથી' : 'Admin Access Denied',
        text: language === 'gu'
          ? 'આ ખાતા પાસે એડમિન પરવાનગી નથી. કૃપા કરીને એડમિન ઓળખપત્રો વાપરો.'
          : 'This account does not have administrator privileges.',
      };
    }
    if (code === 'ACCOUNT_INACTIVE') {
      return {
        title: language === 'gu' ? 'ખાતું નિષ્ક્રિય છે' : 'Account Inactive',
        text: language === 'gu'
          ? 'તમારું ખાતું નિષ્ક્રિય થયેલું છે. કૃપા કરીને શિવ કમ્પ્યુટર સપોર્ટ ડેસ્કનો સંપર્ક કરો.'
          : 'Your account has been deactivated. Please contact support.',
      };
    }
    if (code === 'auth/email-already-in-use') {
      return {
        title: language === 'gu' ? 'ઈમેલ પહેલેથી નોંધાયેલું છે' : 'Email Already In Use',
        text: t.errors.emailAlreadyRegistered,
      };
    }
    if (code === 'auth/invalid-email') {
      return {
        title: language === 'gu' ? 'અમાન્ય ઈમેલ' : 'Invalid Email',
        text: t.errors.emailInvalid,
      };
    }
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return {
        title: language === 'gu' ? 'ખોટો પાસવર્ડ' : 'Authentication Failed',
        text: language === 'gu'
          ? 'ઓળખપત્ર અથવા પાસવર્ડ ખોટો છે. કૃપા કરીને ફરી પ્રયાસ કરો.'
          : 'Incorrect username/email or password. Please try again.',
      };
    }
    if (code === 'auth/weak-password') {
      return {
        title: language === 'gu' ? 'નબળો પાસવર્ડ' : 'Weak Password',
        text: t.errors.passwordTooShort,
      };
    }
    if (code === 'auth/too-many-requests') {
      return {
        title: language === 'gu' ? 'વધુ પડતા પ્રયાસો' : 'Too Many Requests',
        text: language === 'gu'
          ? 'ઘણા નિષ્ફળ પ્રયાસો થયા છે. થોડીવાર રાહ જોઈને ફરી પ્રયાસ કરો.'
          : 'Access temporarily locked due to many failed attempts. Try again later.',
      };
    }
    if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation') {
      return {
        title: language === 'gu' ? 'ઓથેન્ટિકેશન માહિતી' : 'Sign-in Mode Active',
        text: language === 'gu'
          ? 'Firebase Console માં Email/Password પ્રોવાઈડર એનેબલ કરવું જરૂરી છે. લોકલ સિક્યોર સેશન દ્વારા લોગિન કરો.'
          : 'Email/Password sign-in provider is disabled in Firebase Console. Using local secure session.',
      };
    }

    return {
      title: language === 'gu' ? 'ઓથેન્ટિકેશન ભૂલ' : 'Authentication Error',
      text: err?.message || (language === 'gu' ? 'કંઈક ખોટું થયું. ફરી પ્રયાસ કરો.' : 'An error occurred. Please try again.'),
    };
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    const newErrors: { [key: string]: string } = {};

    if (!identifier.trim()) {
      newErrors.identifier =
        role === 'admin'
          ? t.errors.usernameRequired
          : t.errors.emailOrUsernameRequired;
    }

    if (!loginPassword) {
      newErrors.password = t.errors.passwordRequired;
    } else if (loginPassword.length < 4) {
      newErrors.password = t.errors.passwordTooShort;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      await loginWithCredentials({
        identifier: identifier.trim(),
        password: loginPassword,
        expectedRole: role,
      });

      setStatusMessage({
        type: 'success',
        title: t.simulations.loginSuccessTitle,
        text: t.simulations.loginSuccessMsg,
      });

      if (onLoginSuccess) {
        onLoginSuccess(role);
      }
    } catch (err: any) {
      const errInfo = getErrorMessage(err);
      setStatusMessage({
        type: 'error',
        title: errInfo.title,
        text: errInfo.text,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    const newErrors: { [key: string]: string } = {};

    if (!regFullName.trim()) {
      newErrors.name = t.errors.nameRequired;
    }

    const cleanUser = regUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUser || cleanUser.length < 3 || cleanUser.length > 20) {
      newErrors.username = t.errors.usernameInvalid;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim() || !emailPattern.test(regEmail.trim())) {
      newErrors.email = t.errors.emailInvalid;
    }

    if (!regPassword) {
      newErrors.password = t.errors.passwordRequired;
    } else if (regPassword.length < 6) {
      newErrors.password = t.errors.passwordTooShort;
    }

    if (!regConfirmPassword) {
      newErrors.confirmPassword = t.errors.confirmPasswordRequired;
    } else if (regPassword !== regConfirmPassword) {
      newErrors.confirmPassword = t.errors.passwordsDoNotMatch;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);

    try {
      await registerNewUser({
        name: regFullName.trim(),
        username: cleanUser,
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
      });

      setStatusMessage({
        type: 'success',
        title: language === 'gu' ? 'ખાતું સફળતાપૂર્વક બન્યું!' : 'Registration Successful!',
        text: language === 'gu'
          ? 'તમારું નાગરિક ખાતું બની ગયું છે. યુઝર ડેશબોર્ડ ખૂલી રહ્યું છે...'
          : 'Your citizen account has been created. Redirecting to User Dashboard...',
      });

      if (onLoginSuccess) {
        onLoginSuccess('user');
      }
    } catch (err: any) {
      const errInfo = getErrorMessage(err);
      setStatusMessage({
        type: 'error',
        title: errInfo.title,
        text: errInfo.text,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <motion.div
        id="login-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-slate-300/40 dark:shadow-black/50 p-6 sm:p-8"
      >
        {/* Shiv Computer Branding */}
        <BrandLogo brandName={t.brandName} tagline={t.brandTagline} />

        {/* Dynamic Heading & Role Badge */}
        <div className="mt-5 mb-5 text-center">
          <div
            id={`role-indicator-badge-${role}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-2.5 ${
              role === 'admin'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800'
            }`}
          >
            {role === 'admin' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            )}
            <span>{role === 'admin' ? t.adminBadge : t.userBadge}</span>
          </div>

          <h2
            id="login-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            {role === 'admin'
              ? t.adminHeading
              : authMode === 'register'
              ? t.signUpTab
              : t.userHeading}
          </h2>
          <p
            id="login-subtitle"
            className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto"
          >
            {role === 'admin'
              ? t.adminSubtitle
              : authMode === 'register'
              ? (language === 'gu' ? 'નવા વપરાશકર્તા તરીકે નોંધણી કરો' : 'Register to apply and track online government schemes')
              : t.userSubtitle}
          </p>
        </div>

        {/* Citizen Mode: Tab Switcher (Sign In vs Sign Up) */}
        {role === 'user' && (
          <div
            id="auth-mode-tab-bar"
            className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-5 text-xs font-semibold"
          >
            <button
              type="button"
              id="tab-sign-in"
              onClick={() => {
                setAuthMode('login');
                setStatusMessage(null);
                setErrors({});
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.signInTab}</span>
            </button>
            <button
              type="button"
              id="tab-sign-up"
              onClick={() => {
                setAuthMode('register');
                setStatusMessage(null);
                setErrors({});
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                authMode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.signUpTab}</span>
            </button>
          </div>
        )}

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
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{statusMessage.title}</div>
                <div className="text-xs mt-0.5 opacity-90">{statusMessage.text}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1. LOGIN FORM */}
        {authMode === 'login' && (
          <form id="login-form" onSubmit={handleLoginSubmit} noValidate className="space-y-4">
            {/* IDENTIFIER (EMAIL OR USERNAME) */}
            <div>
              <label
                htmlFor="login-identifier-input"
                className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
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
                  type="text"
                  autoComplete={role === 'admin' ? 'username' : 'email'}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: undefined }));
                  }}
                  placeholder={
                    role === 'admin'
                      ? t.adminUsernamePlaceholder
                      : t.userIdentifierPlaceholder
                  }
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3.5 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl transition-all duration-200 outline-none ${
                    errors.identifier
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
                  }`}
                />
              </div>
              {errors.identifier && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.identifier}</span>
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password-input"
                  className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300"
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
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder={t.passwordPlaceholder}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-11 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl transition-all duration-200 outline-none ${
                    errors.password
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
                  }`}
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title={showPassword ? t.hidePassword : t.showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
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
                  className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                />
                <span className="text-slate-600 dark:text-slate-400 font-medium">{t.rememberMe}</span>
              </label>

              <button
                type="button"
                id="forgot-password-link"
                onClick={onForgotPasswordClick}
                className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
              >
                {t.forgotPassword}
              </button>
            </div>

            {/* SUBMIT BUTTON */}
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

            {/* Switch to Register link for citizens */}
            {role === 'user' && (
              <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                <span>{t.dontHaveAccount} </span>
                <button
                  type="button"
                  id="switch-to-signup-link"
                  onClick={() => {
                    setAuthMode('register');
                    setStatusMessage(null);
                    setErrors({});
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {t.signUpLink}
                </button>
              </div>
            )}

            {/* Admin Quick Credentials hint */}
            {role === 'admin' && (
              <div className="pt-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Admin Credentials:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    satu / 123456
                  </span>
                </div>
              </div>
            )}
          </form>
        )}

        {/* 2. REGISTRATION (SIGN UP) FORM */}
        {authMode === 'register' && role === 'user' && (
          <form id="register-form" onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
            {/* FULL NAME */}
            <div>
              <label
                htmlFor="reg-fullname-input"
                className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                {t.fullNameLabel}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="reg-fullname-input"
                  name="fullname"
                  type="text"
                  value={regFullName}
                  onChange={(e) => {
                    setRegFullName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder={t.fullNamePlaceholder}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl transition-all duration-200 outline-none ${
                    errors.name
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* UNIQUE USERNAME */}
            <div>
              <label
                htmlFor="reg-username-input"
                className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                {t.usernameLabel}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <AtSign className="w-4 h-4" />
                </div>
                <input
                  id="reg-username-input"
                  name="username"
                  type="text"
                  value={regUsername}
                  onChange={(e) => {
                    setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                    if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
                  }}
                  placeholder={t.usernamePlaceholder}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl transition-all duration-200 outline-none ${
                    errors.username
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.username}</span>
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="reg-email-input"
                className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                {t.emailLabel}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-email-input"
                  name="email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder={t.emailPlaceholder}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl transition-all duration-200 outline-none ${
                    errors.email
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="reg-password-input"
                className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                {t.passwordLabel}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => {
                    setRegPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Min 6 characters"
                  disabled={isLoading}
                  className={`w-full pl-10 pr-11 py-2.5 bg-white dark:bg-slate-800 border text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl transition-all duration-200 outline-none ${
                    errors.password
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="reg-confirm-password-input"
                className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                {t.confirmPasswordLabel}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm-password-input"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={regConfirmPassword}
                  onChange={(e) => {
                    setRegConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  placeholder={t.confirmPasswordPlaceholder}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-11 py-2.5 bg-white dark:bg-slate-800 border text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl transition-all duration-200 outline-none ${
                    errors.confirmPassword
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-3 focus:ring-rose-500/15'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* REGISTER BUTTON */}
            <div className="pt-2">
              <button
                id="register-submit-button"
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-semibold text-sm transition-all duration-200 shadow-md bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 shadow-indigo-500/25 ${
                  isLoading ? 'opacity-85 cursor-not-allowed' : 'hover:-translate-y-0.5'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.registering}</span>
                  </>
                ) : (
                  <span>{t.registerButton}</span>
                )}
              </button>
            </div>

            {/* Switch to Login link */}
            <div className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400">
              <span>{t.alreadyHaveAccount} </span>
              <button
                type="button"
                id="switch-to-signin-link"
                onClick={() => {
                  setAuthMode('login');
                  setStatusMessage(null);
                  setErrors({});
                }}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t.signInLink}
              </button>
            </div>
          </form>
        )}

        {/* Back to Home Button */}
        <div className="pt-3 text-center">
          <button
            type="button"
            id="back-to-home-button"
            onClick={onBackToHomeClick}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToHome}</span>
          </button>
        </div>

        {/* Security / Firebase Connection Sub-footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Secured with Firebase Authentication & Cloud Firestore</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
