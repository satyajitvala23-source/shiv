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
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LANGUAGES } from '../../translations';
import { LanguageCode, LoginRole } from '../../types';

interface DashboardHeaderProps {
  role: LoginRole;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  role,
  onToggleSidebar,
  isSidebarOpen,
  searchValue,
  onSearchChange,
  searchPlaceholder,
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
  const [internalSearch, setInternalSearch] = useState('');

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

  const currentSearchValue = searchValue !== undefined ? searchValue : internalSearch;
  const handleSearchInput = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearch(val);
    }
  };

  const defaultSearchPlaceholder =
    language === 'gu' ? 'સેવાઓ, ફોર્મ અથવા રેકોર્ડ્સ શોધો...' : 'Search services, forms, records...';

  return (
    <header
      id="dashboard-header-bar"
      className="glass-navbar sticky top-0 z-30 min-h-16 sm:min-h-18 w-full px-3 sm:px-6 py-2 flex items-center justify-between transition-all"
    >
      {/* Left: Mobile Toggle & Brand Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        <button
          type="button"
          id="mobile-sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-blue-500/35 dark:border-white/20 p-1.5 flex items-center justify-center shadow-lg shadow-blue-500/15 relative overflow-hidden group shrink-0">
            {/* Gloss top highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-linear-to-b from-white/60 to-transparent pointer-events-none rounded-t-2xl z-10" />
            <img
              src="/logo.png"
              alt="Shiv Computer Logo"
              className="w-full h-full object-contain relative z-5 transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 z-20 shadow-xs shadow-amber-500/60" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span className="bg-linear-to-r from-blue-700 via-blue-600 to-indigo-600 dark:from-blue-400 dark:via-sky-300 dark:to-white bg-clip-text text-transparent">
                  Shiv Computer
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block align-middle" />
              </span>
              {role === 'admin' ? (
                <div
                  id="header-role-badge"
                  className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-800 dark:text-amber-300 border border-amber-400/30 shadow-2xs backdrop-blur-xs"
                >
                  <ShieldCheck className="w-3 h-3 text-amber-500" />
                  <span>{language === 'gu' ? 'એડમિન પોર્ટલ' : 'Admin Portal'}</span>
                </div>
              ) : (
                <div
                  id="header-role-badge"
                  className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 shadow-2xs backdrop-blur-xs"
                >
                  <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>{language === 'gu' ? 'નાગરિક પોર્ટલ' : 'Citizen Portal'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Glass Search Box (Dynamic responsive search) */}
      <div className="hidden sm:flex flex-1 max-w-md mx-4 items-center">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400 pointer-events-none" />
          <input
            id="navbar-search-input"
            type="text"
            value={currentSearchValue}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder={searchPlaceholder || defaultSearchPlaceholder}
            className="glass-input w-full pl-9 pr-8 py-1.5 text-xs sm:text-sm rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
          />
          {currentSearchValue && (
            <button
              type="button"
              onClick={() => handleSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Language, Theme, Notifications, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Language Selector (Glass style) */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            id="dash-language-button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all shadow-xs active:scale-[0.98]"
            title={language === 'gu' ? 'ભાષા પસંદ કરો (English / ગુજરાતી)' : 'Select Language (English / Gujarati)'}
          >
            <span className="text-sm leading-none">{currentLang.flag}</span>
            <span className="hidden sm:inline font-semibold">{currentLang.nativeLabel}</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangOpen && (
            <div
              id="dash-language-menu"
              className="glass-dropdown absolute right-0 mt-2 w-44 rounded-2xl py-1.5 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 border-b border-slate-100 dark:border-white/10">
                {language === 'gu' ? 'ભાષા પસંદ કરો' : 'Language'}
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  id={`dash-lang-option-${lang.code}`}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                    lang.code === language
                      ? 'bg-blue-50/80 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span>{lang.nativeLabel}</span>
                  </span>
                  {lang.code === language && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
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
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-md transition-all active:scale-[0.98]"
          title={theme === 'light' ? (language === 'gu' ? 'ડાર્ક મોડ ચાલુ કરો' : 'Switch to Dark Mode') : (language === 'gu' ? 'લાઇટ મોડ ચાલુ કરો' : 'Switch to Light Mode')}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notifications Dropdown (Glass style) */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            id="notifications-toggle-button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-md transition-all active:scale-[0.98]"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold shadow-sm ring-1 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div
              id="notifications-dropdown-menu"
              className="glass-dropdown absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl py-3 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-900 dark:text-white">
                  {language === 'gu' ? 'સૂચનાઓ' : 'Notifications'} ({roleNotifications.length})
                </span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {unreadCount} {language === 'gu' ? 'નવી' : 'new'}
                  </span>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                {roleNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    {language === 'gu' ? 'કોઈ નવી સૂચનાઓ નથી' : 'No new notifications'}
                  </div>
                ) : (
                  roleNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3.5 hover:bg-slate-100/50 dark:hover:bg-white/5 cursor-pointer transition-colors ${
                        !n.read ? 'bg-blue-500/10 dark:bg-blue-500/10' : ''
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

        {/* User Profile Dropdown (Glass style) */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            id="user-profile-menu-button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-md transition-all active:scale-[0.98]"
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
              className="glass-dropdown absolute right-0 mt-2 w-56 rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95"
            >
              <div className="p-2 border-b border-slate-100 dark:border-white/10 mb-1">
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
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-blue-50/80 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-colors"
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
