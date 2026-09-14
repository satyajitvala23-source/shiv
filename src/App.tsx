import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HeaderControls } from './components/HeaderControls';
import { LoginForm } from './components/LoginForm';
import { NotificationModal } from './components/NotificationModal';
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
  } = useApp();

  // Modal dialog state for frontend simulations (Forgot password, Back to Home)
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'forgot-password' | 'back-home' | null;
  }>({
    isOpen: false,
    type: null,
  });

  const handleForgotPassword = () => {
    setModalState({
      isOpen: true,
      type: 'forgot-password',
    });
  };

  const handleBackToHome = () => {
    setModalState({
      isOpen: true,
      type: 'back-home',
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      type: null,
    });
  };

  // 1. STRICT ROLE ENFORCEMENT: If in Admin Dashboard view, render ONLY Admin Dashboard
  if (currentView === 'admin-dashboard') {
    return <AdminDashboard />;
  }

  // 2. STRICT ROLE ENFORCEMENT: If in User Dashboard view, render ONLY User Dashboard
  if (currentView === 'user-dashboard') {
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

      {/* MODAL FOR FORGOT PASSWORD AND HOME SIMULATIONS */}
      <NotificationModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        onClose={handleCloseModal}
        title={
          modalState.type === 'forgot-password'
            ? t.simulations.forgotPasswordTitle
            : t.simulations.homeNavTitle
        }
        message={
          modalState.type === 'forgot-password'
            ? t.simulations.forgotPasswordMsg
            : t.simulations.homeNavMsg
        }
        subtext={
          modalState.type === 'forgot-password'
            ? t.simulations.forgotPasswordInstruction
            : undefined
        }
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
