import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderControls } from './components/HeaderControls';
import { LoginForm } from './components/LoginForm';
import { NotificationModal } from './components/NotificationModal';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { UserDashboard } from './components/dashboard/UserDashboard';

function AppContent() {
  const {
    currentView,
    selectedRole,
    setSelectedRole,
    language,
    setLanguage,
    t,
    loginAs,
    isAuthenticated,
    authRole,
    authLoading,
  } = useApp();

  // Dedicated Firebase Auth Forgot Password Modal
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');

  // Modal dialog state for frontend back-to-home simulation
  const [homeModalOpen, setHomeModalOpen] = useState(false);

  const handleForgotPassword = (identifier?: string) => {
    setRecoveryIdentifier(identifier || '');
    setForgotPasswordOpen(true);
  };

  const handleBackToHome = () => {
    setHomeModalOpen(true);
  };

  // If Firebase Auth observer is initially resolving session
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">Loading Shiv Portal...</p>
        </div>
      </div>
    );
  }

  // 1. STRICT ROLE ENFORCEMENT: Admin Dashboard view
  // Verify Firebase Auth & Admin Role. Deny access and redirect to login if unauthorized.
  if (currentView === 'admin-dashboard') {
    if (!isAuthenticated || authRole !== 'admin') {
      return (
        <div
          id="shiv-computer-app-root"
          className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-x-hidden selection:bg-blue-600 selection:text-white"
        >
          <HeaderControls
            role="admin"
            onRoleChange={setSelectedRole}
            language={language}
            onLanguageChange={setLanguage}
            adminLabel={t.adminRole}
            userLabel={t.userRole}
          />
          <main
            id="login-main-content"
            className="flex-1 flex items-center justify-center py-6 sm:py-10 z-10"
          >
            <LoginForm
              role="admin"
              t={t}
              onForgotPasswordClick={handleForgotPassword}
              onBackToHomeClick={handleBackToHome}
              onLoginSuccess={(role) => loginAs(role)}
            />
          </main>
        </div>
      );
    }
    return <AdminDashboard />;
  }

  // 2. STRICT ROLE ENFORCEMENT: User Dashboard view
  if (currentView === 'user-dashboard') {
    if (!isAuthenticated) {
      return (
        <div
          id="shiv-computer-app-root"
          className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-x-hidden selection:bg-blue-600 selection:text-white"
        >
          <HeaderControls
            role="user"
            onRoleChange={setSelectedRole}
            language={language}
            onLanguageChange={setLanguage}
            adminLabel={t.adminRole}
            userLabel={t.userRole}
          />
          <main
            id="login-main-content"
            className="flex-1 flex items-center justify-center py-6 sm:py-10 z-10"
          >
            <LoginForm
              role="user"
              t={t}
              onForgotPasswordClick={handleForgotPassword}
              onBackToHomeClick={handleBackToHome}
              onLoginSuccess={(role) => loginAs(role)}
            />
          </main>
        </div>
      );
    }
    return <UserDashboard />;
  }

  // 3. Login Page view (Default entry view)
  return (
    <div
      id="shiv-computer-app-root"
      className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative overflow-x-hidden selection:bg-blue-600 selection:text-white"
    >
      {/* Background Tech mesh dots & clean ambient soft glow */}
      <div
        className="fixed inset-0 pointer-events-none opacity-40 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]"
        aria-hidden="true"
      />
      <div
        className="fixed -top-40 -right-40 w-96 h-96 rounded-full bg-blue-100/50 dark:bg-blue-950/30 blur-3xl pointer-events-none z-0"
        aria-hidden="true"
      />
      <div
        className="fixed -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-100/50 dark:bg-indigo-950/30 blur-3xl pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* TOP BAR / HEADER with TOP-RIGHT CORNER LOGIN TYPE & LANGUAGE SELECTOR */}
      <HeaderControls
        role={selectedRole}
        onRoleChange={setSelectedRole}
        language={language}
        onLanguageChange={setLanguage}
        adminLabel={t.adminRole}
        userLabel={t.userRole}
      />

      {/* MAIN CONTAINER: Centered Login Card */}
      <main
        id="login-main-content"
        className="flex-1 flex items-center justify-center py-6 sm:py-10 z-10"
      >
        <LoginForm
          role={selectedRole}
          t={t}
          onForgotPasswordClick={handleForgotPassword}
          onBackToHomeClick={handleBackToHome}
          onLoginSuccess={(role) => loginAs(role)}
        />
      </main>

      {/* FOOTER */}
      <footer
        id="login-page-footer"
        className="w-full py-4 px-6 text-center text-xs text-slate-400 dark:text-slate-500 z-10 border-t border-slate-200/50 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xs"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p>© {new Date().getFullYear()} {t.footerRights}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Address: Near Old Railway Crossing, Char Chok, Keshod - 362220
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              Owner: Raviraj Makvana
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <a
              id="footer-whatsapp-btn"
              href="https://wa.me/919213488440"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <span>WhatsApp: +91 92134 88440</span>
            </a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-default">
              Government CSC & Digital Gujarat Services
            </span>
          </div>
        </div>
      </footer>

      {/* REAL FIREBASE AUTH FORGOT PASSWORD RECOVERY MODAL */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        initialIdentifier={recoveryIdentifier}
        language={language}
        t={t}
      />

      {/* MODAL FOR HOME NAVIGATION */}
      <NotificationModal
        isOpen={homeModalOpen}
        type="back-home"
        onClose={() => setHomeModalOpen(false)}
        title={t.simulations.homeNavTitle}
        message={t.simulations.homeNavMsg}
        closeText={t.simulations.close}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
