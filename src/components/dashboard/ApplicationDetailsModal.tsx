import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Send,
  Download,
  Upload,
} from 'lucide-react';
import { Application, ApplicationStatus, LoginRole } from '../../types';
import { useApp } from '../../context/AppContext';

interface ApplicationDetailsModalProps {
  application: Application | null;
  role: LoginRole;
  onClose: () => void;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  application,
  role,
  onClose,
}) => {
  const { updateApplicationStatus, uploadUserDoc } = useApp();

  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>(
    application?.status || 'Pending'
  );
  const [adminNoteInput, setAdminNoteInput] = useState(application?.adminNotes || '');
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [newDocUploadName, setNewDocUploadName] = useState('');

  useEffect(() => {
    if (application) {
      setSelectedStatus(application.status);
      setAdminNoteInput(application.adminNotes || '');
    }
  }, [application]);

  if (!application) return null;

  const handleStatusSave = () => {
    updateApplicationStatus(application.id, selectedStatus, adminNoteInput);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleQuickApprove = () => {
    setSelectedStatus('Approved');
    updateApplicationStatus(application.id, 'Approved', 'Application approved. All documents verified.');
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleQuickReject = () => {
    setSelectedStatus('Rejected');
    updateApplicationStatus(application.id, 'Rejected', 'Application does not meet department eligibility.');
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleQuickDocCorrection = () => {
    setSelectedStatus('Document Required');
    const note = 'Additional or clearer documents required. Please re-upload verified files.';
    setAdminNoteInput(note);
    updateApplicationStatus(application.id, 'Document Required', note);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleUploadNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocUploadName.trim()) return;
    uploadUserDoc(application.id, newDocUploadName.trim());
    setNewDocUploadName('');
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Document Required':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div
      id="application-details-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        id="application-details-modal-card"
        className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-left animate-in zoom-in-95"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                {application.id}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(application.status)}`}>
                {application.status}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
              {application.serviceName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          {/* Applicant & Meta Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Applicant Information
              </div>
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                <User className="w-4 h-4 text-slate-400" />
                <span>{application.applicantName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{application.applicantEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{application.applicantPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-xs">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{application.applicantAddress}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Application Timelines & Fee
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Submitted: <strong>{application.applicationDate}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Last Updated: {application.lastUpdated}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span>Fee: <strong>₹{application.fee}</strong></span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                  {application.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Required Verification Documents</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {application.requiredDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Uploaded Documents ({application.uploadedDocuments.length})</span>
              </span>
            </h4>

            <div className="space-y-2">
              {application.uploadedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm">
                        {doc.name}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>{doc.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        doc.status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                          : doc.status === 'Needs Correction'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {doc.status}
                    </span>
                    <button
                      type="button"
                      title="Download document copy"
                      onClick={() => alert(`Simulating download for: ${doc.name}`)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* If user needs to upload additional or corrected doc */}
            {role === 'user' && (
              <form onSubmit={handleUploadNewDoc} className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Updated_Passport_Photo.pdf or Land_Extract_New.pdf"
                  value={newDocUploadName}
                  onChange={(e) => setNewDocUploadName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  disabled={!newDocUploadName.trim()}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              </form>
            )}
          </div>

          {/* Admin Notes / Remarks */}
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
            <h4 className="font-semibold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Official Admin Remarks</span>
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-200/90 leading-relaxed">
              {application.adminNotes || 'No notes currently attached to this application.'}
            </p>
          </div>

          {/* ADMIN MANAGEMENT CONTROLS (STRICTLY FOR ADMIN ONLY) */}
          {role === 'admin' && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Administrator Status & Workflow Controls
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Change Application Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Document Required">Document Required</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Update Admin Note for Applicant
                  </label>
                  <input
                    type="text"
                    value={adminNoteInput}
                    onChange={(e) => setAdminNoteInput(e.target.value)}
                    placeholder="Provide clear notes or instructions for user"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickApprove}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickDocCorrection}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Request Correction</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickReject}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs flex items-center gap-1 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleStatusSave}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Save Status & Note</span>
                </button>
              </div>

              {isSavedNotice && (
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs text-center font-medium animate-in fade-in">
                  Status and notes updated successfully!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/70 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
