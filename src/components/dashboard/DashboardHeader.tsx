import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Globe,
  Check,
  ChevronDown,
  LogOut,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LANGUAGES } from '../../translations';
import { LanguageCode, LoginRole } from '../../types';

interface DashboardHeaderProps {
  role: LoginRole;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  role,
  onToggleSidebar,
  isSidebarOpen,
}) => {
  const {
    t,
    language,
    setLanguage,
    theme,
    toggleTheme,
    currentUser,
    notifications,
    markNotificationAsRead,
    logout,
  } = useApp();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  // Filter notifications for this role
  const roleNotifications = notifications.filter(
    (n) => n.targetRole === 'all' || n.targetRole === role || (role === 'user' && n.userId === currentUser.id)
  );
  const unreadCount = roleNotifications.filter((n) => !n.read).length;

  return (
    <header
      id="dashboard-header-bar"
      className="sticky top-0 z-30 h-16 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors"
    >
      {/* Left: Mobile Toggle & Brand Identity */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          id="mobile-sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 p-0.5 flex items-center justify-center shadow-xs">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-sky-400 text-xs tracking-wider">
              SC
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                Shiv Computer
              </span>
              {role === 'admin' ? (
                <div
                  id="header-role-badge"
                  className="hidden xs:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs"
                >
                  <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Admin Portal</span>
                </div>
              ) : (
                <div
                  id="header-role-badge"
                  className="hidden xs:inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs"
                >
                  <UserCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Citizen Portal</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Controls: Language, Theme, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            id="dash-language-button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">{currentLang.nativeLabel}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isLangOpen && (
            <div
              id="dash-language-menu"
              className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                    lang.code === language
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{lang.nativeLabel}</span>
                  {lang.code === language && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark/Light Mode Toggle */}
        <button
          type="button"
          id="theme-toggle-button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            id="notifications-toggle-button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div
              id="notifications-dropdown-menu"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-900 dark:text-white">
                  Notifications ({roleNotifications.length})
                </span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {roleNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  roleNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            id="user-profile-menu-button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {role === 'admin' ? 'A' : currentUser.name.charAt(0)}
            </div>
            <span className="hidden lg:block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
              {role === 'admin' ? 'Super Admin' : currentUser.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isProfileOpen && (
            <div
              id="user-profile-dropdown-menu"
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <div className="font-semibold text-xs text-slate-900 dark:text-white">
                  {role === 'admin' ? (currentUser.name || 'Shiv Master Administrator') : (currentUser.name || 'Citizen User')}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser.email || (role === 'admin' ? 'Administrator' : 'Citizen')}
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  id="header-logout-btn"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{role === 'admin' ? t.adminSidebar.logout : t.userSidebar.logout}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
