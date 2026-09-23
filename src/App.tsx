import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { LoginForm } from './components/LoginForm';
import { HeaderControls } from './components/HeaderControls';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';
import { AIChatbot } from './components/AIChatbot';

function AppContent() {
  const {
    currentView,
    setCurrentView,
    authLoading,
    isAuthenticated,
    authRole,
    selectedRole,
    setSelectedRole,
    language,
    setLanguage,
    t,
  } = useApp();

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotInitialIdentifier, setForgotInitialIdentifier] = useState('');

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-500">
            {language === 'gu' ? 'શિવ કમ્પ્યુટર પોર્ટલ લોડ થઈ રહ્યું છે...' : 'Loading Shiv Portal...'}
          </p>
        </div>
      </div>
    );
  }

  // Gatekeeper: Enforce Sign In / Sign Up for Admin or User before website open
  if (!isAuthenticated || currentView === 'login' || currentView === 'register' || currentView === 'admin-login') {
    const activeAuthRole = currentView === 'admin-login' ? 'admin' : (currentView === 'register' ? 'user' : selectedRole);

    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
        <HeaderControls
          role={activeAuthRole}
          onRoleChange={(newRole) => {
            setSelectedRole(newRole);
            if (newRole === 'admin') {
              setCurrentView('admin-login');
              window.location.hash = '#/admin-login';
            } else {
              setCurrentView('login');
              window.location.hash = '#/login';
            }
          }}
          language={language}
          onLanguageChange={setLanguage}
          adminLabel={t.adminBadge}
          userLabel={t.userBadge}
        />

        <main className="flex-1 flex items-center justify-center py-6 sm:py-10 px-4">
          <LoginForm
            role={activeAuthRole}
            t={t}
            onForgotPasswordClick={(id) => {
              setForgotInitialIdentifier(id || '');
              setIsForgotModalOpen(true);
            }}
            onBackToHomeClick={() => {
              if (activeAuthRole === 'admin') {
                setSelectedRole('user');
                setCurrentView('login');
                window.location.hash = '#/login';
              } else {
                setSelectedRole('admin');
                setCurrentView('admin-login');
                window.location.hash = '#/admin-login';
              }
            }}
            onLoginSuccess={(role) => {
              if (role === 'admin') {
                setCurrentView('admin-dashboard');
                window.location.hash = '#/admin-dashboard';
              } else {
                setCurrentView('user-dashboard');
                window.location.hash = '#/user-dashboard';
              }
            }}
          />
        </main>

        <ForgotPasswordModal
          isOpen={isForgotModalOpen}
          onClose={() => setIsForgotModalOpen(false)}
          initialIdentifier={forgotInitialIdentifier}
          language={language}
          t={t}
        />
        <AIChatbot />
      </div>
    );
  }

  // Strict RBAC protection: Only users with role === 'admin' can access Admin Dashboard
  return (
    <>
      {currentView === 'admin-dashboard' && authRole === 'admin' ? (
        <AdminDashboard />
      ) : (
        <UserDashboard />
      )}
      <AIChatbot />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
