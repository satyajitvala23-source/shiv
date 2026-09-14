import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Loader2, FileCheck, IndianRupee } from 'lucide-react';
import { ServiceItem, Application } from '../../types';
import { useApp } from '../../context/AppContext';

interface ApplyServiceModalProps {
  isOpen: boolean;
  service: ServiceItem | null;
  onClose: () => void;
  onSuccess: (app: Application) => void;
}

export const ApplyServiceModal: React.FC<ApplyServiceModalProps> = ({
  isOpen,
  service,
  onClose,
  onSuccess,
}) => {
  const { currentUser, applyForService } = useApp();
  const [notes, setNotes] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !service) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const created = applyForService(service, notes);
      setIsSubmitting(false);
      onSuccess(created);
      onClose();
    }, 1000);
  };

  return (
    <div
      id="apply-service-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="apply-service-modal-card"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left animate-in zoom-in-95"
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {service.category === 'agriculture' ? 'Agriculture Scheme Application' : 'Citizen Service Application'}
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {service.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Service summary pill */}
          <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Processing Fee:</span>
              <span className="font-bold text-base text-blue-700 dark:text-blue-300 flex items-center">
                ₹{service.fee}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">Expected Processing:</span>
              <span className="font-medium text-slate-900 dark:text-white">{service.processingTime}</span>
            </div>
          </div>

          {/* Applicant Info Confirmation */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1 text-xs">
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              Applicant: {currentUser.name}
            </div>
            <div className="text-slate-500 dark:text-slate-400">{currentUser.email} • {currentUser.phone}</div>
            <div className="text-slate-500 dark:text-slate-400 truncate">{currentUser.address}</div>
          </div>

          {/* Required Documents Notice */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Mandatory Documents to be auto-attached:</span>
            </label>
            <div className="space-y-1">
              {service.requiredDocuments.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Remarks/Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Additional Details or Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Survey number, urgent timeline, previous certificate details"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              id="confirm-terms"
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
            <label htmlFor="confirm-terms" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              I declare that the details provided are accurate and authorize Shiv Computer to process my application on government portals.
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !agreed}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{service.fee} & Submit Application</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
