import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, User, Globe, ChevronDown, Check } from 'lucide-react';
import { LanguageCode, LoginRole } from '../types';
import { LANGUAGES } from '../translations';

interface HeaderControlsProps {
  role: LoginRole;
  onRoleChange: (role: LoginRole) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  adminLabel: string;
  userLabel: string;
}

export const HeaderControls: React.FC<HeaderControlsProps> = ({
  role,
  onRoleChange,
  language,
  onLanguageChange,
  adminLabel,
  userLabel,
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <header
      id="login-header-bar"
      className="w-full px-4 py-3 sm:px-8 sm:py-5 flex items-center justify-between z-30"
    >
      {/* Left corner official Shiv Computer logo branding */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 px-3 py-2 rounded-2xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden bg-white/95 dark:bg-slate-950 p-1 sm:p-1.5 flex items-center justify-center border border-blue-500/30 relative shadow-2xs shrink-0 group">
            {/* Subtle gloss overlay */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-linear-to-b from-white/50 to-transparent pointer-events-none rounded-t-xl" />
            <img
              src="/logo.png"
              alt="Shiv Computer Logo"
              className="w-full h-full object-contain relative z-5 transition-transform duration-200 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight leading-tight flex items-center gap-1.5">
              <span>Shiv Computer</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0 shadow-2xs shadow-amber-400/50" />
            </span>
            <span className="text-[11px] sm:text-xs text-blue-600 dark:text-sky-400 font-semibold leading-tight hidden xs:inline">
              Digital Gujarat & CSC
            </span>
          </div>
        </div>
      </div>

      {/* TOP-RIGHT CORNER: Controls cluster */}
      <div id="top-right-controls" className="flex items-center gap-2.5 sm:gap-3 ml-auto">
        {/* Language Selector Dropdown */}
        <div className="relative" ref={langRef} id="language-selector-container">
          <button
            type="button"
            id="language-selector-button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white/90 text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-50 transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Select Language"
            aria-expanded={isLangOpen}
          >
            <span className="text-base leading-none">{currentLang.flag}</span>
            <span className="font-medium">{currentLang.nativeLabel}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>

          {isLangOpen && (
            <div
              id="language-dropdown-menu"
              className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-slate-200/90 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Language / ભાષા
              </div>
              {LANGUAGES.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    key={lang.code}
                    id={`lang-option-${lang.code}`}
                    type="button"
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.nativeLabel}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* LOGIN TYPE OPTION (TOP-RIGHT CORNER) */}
        {/* Responsive: Segmented toggle button on medium+ screens, dropdown on extra small */}
        <div id="login-type-selector-wrapper" className="flex items-center">
          {/* Modern Segmented Pill Toggle for desktop/tablet */}
          <div
            id="login-type-toggle-group"
            className="hidden xs:inline-flex p-1 bg-slate-100/90 border border-slate-200 rounded-xl shadow-xs"
            role="radiogroup"
            aria-label="Login Type Selector"
          >
            <button
              type="button"
              id="role-toggle-admin"
              role="radio"
              aria-checked={role === 'admin'}
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                role === 'admin'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${role === 'admin' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{adminLabel}</span>
            </button>

            <button
              type="button"
              id="role-toggle-user"
              role="radio"
              aria-checked={role === 'user'}
              onClick={() => onRoleChange('user')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                role === 'user'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className={`w-3.5 h-3.5 ${role === 'user' ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{userLabel}</span>
            </button>
          </div>

          {/* Compact Dropdown view for very narrow mobile screens */}
          <div className="relative xs:hidden" ref={roleRef} id="login-type-mobile-dropdown">
            <button
              type="button"
              id="role-dropdown-mobile-btn"
              onClick={() => setIsRoleDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-semibold shadow-xs"
            >
              {role === 'admin' ? (
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <User className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>{role === 'admin' ? adminLabel : userLabel}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                <button
                  type="button"
                  id="mobile-role-select-admin"
                  onClick={() => {
                    onRoleChange('admin');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left ${
                    role === 'admin' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    {adminLabel}
                  </span>
                  {role === 'admin' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  type="button"
                  id="mobile-role-select-user"
                  onClick={() => {
                    onRoleChange('user');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left ${
                    role === 'user' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    {userLabel}
                  </span>
                  {role === 'user' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
