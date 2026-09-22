import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { UserDashboard } from './components/dashboard/UserDashboard';

function AppContent() {
  const { currentView, authLoading } = useApp();

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

  if (currentView === 'admin-dashboard') {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
