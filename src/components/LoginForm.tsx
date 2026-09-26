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
  Phone,
} from 'lucide-react';
import { LoginRole, TranslationStrings } from '../types';
import { BrandLogo } from './BrandLogo';
import { useApp } from '../context/AppContext';

interface LoginFormProps {
  role: LoginRole;
  t: TranslationStrings;
  onForgotPasswordClick?: (prefillIdentifier?: string) => void;
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
  const { loginWithCredentials, registerNewUser, language, currentView, setCurrentView, setSelectedRole } = useApp();

  // Mode: 'login' | 'register' (Registration is available for citizens/users)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form Values
  const [identifier, setIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form Values
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
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

  // Sync authMode with currentView
  useEffect(() => {
    if (currentView === 'register') {
      setAuthMode('register');
    } else {
      setAuthMode('login');
    }
  }, [currentView]);

  // When role changes, if Admin is selected, switch mode to 'login' and ensure no credentials prefill
  useEffect(() => {
    setIdentifier('');
    setLoginPassword('');
    setShowPassword(false);
    if (role === 'admin') {
      setAuthMode('login');
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
    if (code === 'auth/user-not-found') {
      return {
        title: language === 'gu' ? 'ખાતું મળ્યું નથી' : 'Account Not Found',
        text: language === 'gu'
          ? 'આ ઈમેલ અથવા યુઝરનેમ સાથે કોઈ ખાતું મળ્યું નથી. કૃપા કરીને પહેલા રજીસ્ટ્રેશન કરો.'
          : 'No registered account found with this email or username. Please register first.',
      };
    }
    if (code === 'auth/network-request-failed') {
      return {
        title: language === 'gu' ? 'નેટવર્ક સમસ્યા' : 'Network Error',
        text: language === 'gu'
          ? 'નેટવર્ક કનેક્શન સમસ્યા. કૃપા કરીને તમારું ઇન્ટરનેટ તપાસો.'
          : 'Network connection problem. Please verify your internet connection.',
      };
    }
    if (code === 'permission-denied' || code === 'auth/permission-denied') {
      return {
        title: language === 'gu' ? 'પરવાનગી નકારી' : 'Permission Denied',
        text: language === 'gu'
          ? 'તમારી પાસે આ ઓપરેશન કરવાની પરવાનગી નથી.'
          : 'Permission denied. You do not have authorization for this operation.',
      };
    }
    if (code === 'unavailable') {
      return {
        title: language === 'gu' ? 'સર્વિસ ઉપલબ્ધ નથી' : 'Service Unavailable',
        text: language === 'gu'
          ? 'ફાયરબેઝ સેવા અસ્થાયી રૂપે ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.'
          : 'Firebase service is temporarily unavailable. Please try again shortly.',
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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regEmail.trim() || !emailPattern.test(regEmail.trim())) {
      newErrors.email = t.errors.emailInvalid;
    }

    const cleanMobile = regMobile.trim().replace(/[^0-9]/g, '');
    if (!cleanMobile) {
      newErrors.mobile = t.errors.mobileRequired || 'Mobile number is required';
    } else if (cleanMobile.length !== 10) {
      newErrors.mobile = t.errors.mobileInvalid || 'Please enter a valid 10-digit mobile number';
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
        email: regEmail.trim().toLowerCase(),
        mobile: cleanMobile,
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
        className="iphone-glass-card p-6 sm:p-8 relative overflow-hidden"
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
                setCurrentView('login');
                window.location.hash = '#/login';
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
                setCurrentView('register');
                window.location.hash = '#/register';
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
                  : 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
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
                      ? 'border-amber-400 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
                  }`}
                />
              </div>
              {errors.identifier && (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
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
                  type={role === 'admin' ? 'password' : (showPassword ? 'text' : 'password')}
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder={t.passwordPlaceholder}
                  disabled={isLoading}
                  className={`w-full pl-10 ${role === 'admin' ? 'pr-3.5' : 'pr-11'} py-2.5 sm:py-3 bg-white dark:bg-slate-800 border text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl transition-all duration-200 outline-none ${
                    errors.password
                      ? 'border-amber-400 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
                  }`}
                />
                {role !== 'admin' && (
                  <button
                    type="button"
                    id="toggle-password-visibility-btn"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    title={showPassword ? t.hidePassword : t.showPassword}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
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
                onClick={() => onForgotPasswordClick(identifier.trim())}
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
                className={`btn-glossy-primary w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm ${
                  isLoading ? 'opacity-85 cursor-not-allowed' : 'active:scale-98'
                }`}
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
                    setCurrentView('register');
                    window.location.hash = '#/register';
                    setStatusMessage(null);
                    setErrors({});
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {t.signUpLink}
                </button>
              </div>
            )}

            {/* Quick Switch to Admin Portal */}
            {role === 'user' && (
              <div className="pt-2 text-center text-xs">
                <button
                  type="button"
                  id="switch-to-admin-login-link"
                  onClick={() => {
                    setSelectedRole('admin');
                    setCurrentView('admin-login');
                    window.location.hash = '#/admin-login';
                    setStatusMessage(null);
                    setErrors({});
                  }}
                  className="font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>{language === 'gu' ? 'એડમિન પોર્ટલ લોગિન' : 'Admin Access Portal'} &rarr;</span>
                </button>
              </div>
            )}

            {/* Quick Switch from Admin to Citizen Portal */}
            {role === 'admin' && (
              <div className="pt-2 text-center text-xs">
                <button
                  type="button"
                  id="switch-to-citizen-login-link"
                  onClick={() => {
                    setSelectedRole('user');
                    setCurrentView('login');
                    window.location.hash = '#/login';
                    setStatusMessage(null);
                    setErrors({});
                  }}
                  className="font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>&larr; {language === 'gu' ? 'નાગરિક પોર્ટલ પર પાછા જાઓ' : 'Return to Citizen Portal'}</span>
                </button>
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
                      ? 'border-amber-400 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.name}</span>
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
                      ? 'border-amber-400 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* MOBILE NUMBER */}
            <div>
              <label
                htmlFor="reg-mobile-input"
                className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                {t.mobileLabel}
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="reg-mobile-input"
                  name="mobile"
                  type="tel"
                  maxLength={10}
                  value={regMobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setRegMobile(val);
                    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }));
                  }}
                  placeholder={t.mobilePlaceholder}
                  disabled={isLoading}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border text-xs sm:text-sm text-slate-900 dark:text-white rounded-xl transition-all duration-200 outline-none ${
                    errors.mobile
                      ? 'border-amber-400 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
                  }`}
                />
              </div>
              {errors.mobile && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.mobile}</span>
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
                      ? 'border-amber-400 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
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
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
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
                      ? 'border-amber-400 focus:border-amber-500 focus:ring-3 focus:ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
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
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
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
                className={`btn-glossy-primary w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm ${
                  isLoading ? 'opacity-85 cursor-not-allowed' : 'active:scale-98'
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
                  setCurrentView('login');
                  window.location.hash = '#/login';
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
