import React from 'react';
import { X, KeyRound, Home, CheckCircle2 } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  type: 'forgot-password' | 'back-home' | 'login-success' | null;
  onClose: () => void;
  title: string;
  message: string;
  subtext?: string;
  closeText: string;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  type,
  onClose,
  title,
  message,
  subtext,
  closeText,
}) => {
  if (!isOpen || !type) return null;

  return (
    <div
      id="notification-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="notification-modal-card"
        className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200/90 text-left relative animate-in zoom-in-95 duration-200"
      >
        <button
          type="button"
          id="modal-close-icon-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
            {type === 'forgot-password' && <KeyRound className="w-6 h-6" />}
            {type === 'back-home' && <Home className="w-6 h-6" />}
            {type === 'login-success' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          </div>

          <div className="space-y-1.5 flex-1 pr-4">
            <h3 id="modal-title" className="text-lg font-bold text-slate-900">
              {title}
            </h3>
            <p id="modal-message" className="text-sm text-slate-600 leading-relaxed">
              {message}
            </p>
            {subtext && (
              <p id="modal-subtext" className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                {subtext}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            id="modal-dismiss-button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            {closeText}
          </button>
        </div>
      </div>
    </div>
  );
};
