import React, { useState } from 'react';
import {
  LayoutDashboard,
  Send,
  FileSpreadsheet,
  Sprout,
  Layers,
  FileText,
  UploadCloud,
  CheckCircle2,
  CreditCard,
  Bell,
  HelpCircle,
  User,
  LogOut,
  Search,
  ArrowRight,
  Download,
  Clock,
  AlertCircle,
  FileCheck,
  Check,
  Phone,
  Mail,
  MapPin,
  Calendar,
  KeyRound,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Application, ApplicationStatus, FormTemplate, ServiceItem } from '../../types';
import { DashboardHeader } from './DashboardHeader';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';
import { ApplyServiceModal } from './ApplyServiceModal';
import { OfficeAddressCard } from './OfficeAddressCard';
import { QuickServiceCards } from './QuickServiceCards';
import { AnimatedCounter } from '../AnimatedCounter';
import { sendPasswordReset, resendVerificationEmail, auth } from '../../lib/firebase';

type UserTab =
  | 'dashboard'
  | 'apply'
  | 'myApplications'
  | 'agriculture'
  | 'availableServices'
  | 'downloadForms'
  | 'uploadDocs'
  | 'applicationStatus'
  | 'paymentHistory'
  | 'notifications'
  | 'helpSupport'
  | 'myProfile';

export const UserDashboard: React.FC = () => {
  const {
    t,
    language,
    logout,
    currentUser,
    applications,
    services,
    agricultureServices,
    forms,
    payments,
    notifications,
    updateUserProfile,
    incrementFormDownload,
    websiteContent,
  } = useApp();

  const getStatusLabel = (status: ApplicationStatus): string => {
    switch (status) {
      case 'Approved':
        return t?.status?.approved || (language === 'gu' ? 'મંજૂર' : 'Approved');
      case 'Completed':
        return t?.status?.completed || (language === 'gu' ? 'પૂર્ણ થયેલ' : 'Completed');
      case 'Processing':
        return t?.status?.processing || (language === 'gu' ? 'પ્રક્રિયા હેઠળ' : 'Processing');
      case 'Pending':
        return t?.status?.pending || (language === 'gu' ? 'બાકી' : 'Pending');
      case 'Document Required':
        return t?.status?.documentRequired || (language === 'gu' ? 'દસ્તાવેજ જરૂરી' : 'Document Required');
      case 'Rejected':
        return t?.status?.rejected || (language === 'gu' ? 'નામંજૂર' : 'Rejected');
      default:
        return status;
    }
  };

  const [activeTab, setActiveTab] = useState<UserTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // User-specific applications and payments (strict role separation!)
  const userApplications = applications.filter((app) => app.applicantId === currentUser.id);
  const userPayments = payments.filter((p) => p.applicantId === currentUser.id);

  // Modals
  const [selectedAppForModal, setSelectedAppForModal] = useState<Application | null>(null);
  const [serviceToApply, setServiceToApply] = useState<ServiceItem | null>(null);

  // Quick Tracking
  const [trackSearchId, setTrackSearchId] = useState('');
  const [trackedApp, setTrackedApp] = useState<Application | null>(null);

  // Profile Form state
  const [nameInput, setNameInput] = useState(currentUser.name);
  const [phoneInput, setPhoneInput] = useState(currentUser.phone);
  const [addressInput, setAddressInput] = useState(currentUser.address);
  const [profileSavedNotice, setProfileSavedNotice] = useState(false);

  // Profile password reset state
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSendProfilePasswordReset = async () => {
    if (!currentUser.email) return;
    setIsResettingPassword(true);
    setResetStatus(null);
    try {
      await sendPasswordReset(currentUser.email);
      setResetStatus({
        type: 'success',
        message: `Password reset email dispatched to ${currentUser.email}. Follow the email instructions to reset your password.`,
      });
    } catch (err: any) {
      setResetStatus({
        type: 'error',
        message: err?.message || 'Could not send reset link. Please check your connection.',
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Support inquiry state
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

  // Email verification state (Requirement 14)
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleResendVerification = async () => {
    setResendStatus('sending');
    try {
      await resendVerificationEmail();
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    }
  };

  // Counts for user
  const totalUserApps = userApplications.length;
  const pendingUserApps = userApplications.filter((a) => a.status === 'Pending').length;
  const processingUserApps = userApplications.filter((a) => a.status === 'Processing').length;
  const approvedUserApps = userApplications.filter(
    (a) => a.status === 'Approved' || a.status === 'Completed'
  ).length;
  const rejectedUserApps = userApplications.filter((a) => a.status === 'Rejected').length;

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackSearchId.trim()) return;
    const found = applications.find(
      (a) => a.id.toLowerCase() === trackSearchId.trim().toLowerCase()
    );
    if (found) {
      setTrackedApp(found);
    } else {
      alert(`No application found matching reference "${trackSearchId}". Please check your receipt.`);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: nameInput.trim(),
      phone: phoneInput.trim(),
      address: addressInput.trim(),
    });
    setProfileSavedNotice(true);
    setTimeout(() => setProfileSavedNotice(false), 2000);
  };

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirySubject.trim() || !inquiryMessage.trim()) return;
    setInquirySent(true);
    setTimeout(() => {
      setInquirySent(false);
      setInquirySubject('');
      setInquiryMessage('');
      alert('Your message has been received by Shiv Computer Helpdesk. We will call you back shortly.');
    }, 1200);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Document Required':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Rejected':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Nav Items list matching exact prompt user sidebar requirements
  const navItems = [
    { id: 'dashboard' as UserTab, label: t.userSidebar.dashboard, icon: LayoutDashboard },
    { id: 'apply' as UserTab, label: t.userSidebar.applyForService, icon: Send },
    { id: 'myApplications' as UserTab, label: t.userSidebar.myApplications, icon: FileSpreadsheet, badge: userApplications.length },
    { id: 'agriculture' as UserTab, label: t.userSidebar.agricultureServices, icon: Sprout },
    { id: 'availableServices' as UserTab, label: t.userSidebar.availableServices, icon: Layers },
    { id: 'downloadForms' as UserTab, label: t.userSidebar.downloadForms, icon: FileText },
    { id: 'uploadDocs' as UserTab, label: t.userSidebar.uploadDocuments, icon: UploadCloud },
    { id: 'applicationStatus' as UserTab, label: t.userSidebar.applicationStatus, icon: CheckCircle2 },
    { id: 'paymentHistory' as UserTab, label: t.userSidebar.paymentHistory, icon: CreditCard },
    { id: 'notifications' as UserTab, label: t.userSidebar.notifications, icon: Bell },
    { id: 'helpSupport' as UserTab, label: t.userSidebar.helpSupport, icon: HelpCircle },
    { id: 'myProfile' as UserTab, label: t.userSidebar.myProfile, icon: User },
  ];

  return (
    <div id="user-dashboard-container" className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-white relative z-10">
      {/* Header */}
      <DashboardHeader
        role="user"
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          id="user-sidebar"
          className={`glass-sidebar fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Scrollable Navigation */}
          <div className="p-3 overflow-y-auto space-y-1">
            {/* Sidebar Official Brand Badge */}
            <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 shadow-xs">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-transparent p-0.5 sm:p-1 flex items-center justify-center shrink-0 overflow-hidden relative group">
                <img
                  src="/logo.png"
                  alt="Shiv Computer"
                  className="w-full h-full object-contain filter drop-shadow-md relative z-5 transition-transform duration-200 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                  Shiv Computer
                </span>
                <span className="text-[11px] text-blue-600 dark:text-sky-400 font-semibold leading-none mt-0.5">
                  {language === 'gu' ? 'નાગરિક સેવા પોર્ટલ' : 'Citizen Portal'}
                </span>
              </div>
            </div>

            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {language === 'gu' ? 'સેવાઓ અને મેનૂ' : 'Services & Navigation'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`user-nav-${item.id}`}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-blue-600/90 to-sky-600/90 text-white shadow-md shadow-blue-500/25 border border-white/20 backdrop-blur-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Logout */}
          <div className="p-3 border-t border-slate-200/60 dark:border-white/10">
            <button
              type="button"
              id="user-sidebar-logout-btn"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 transition-colors active:scale-98"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.userSidebar.logout}</span>
            </button>
          </div>
        </aside>

        {/* Sidebar Backdrop on Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden animate-in fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Email Verification Banner (Requirement 14) */}
          {auth?.currentUser && !auth.currentUser.emailVerified && (
            <div
              id="user-email-verification-banner"
              className="glass-card mb-6 p-4 rounded-2xl border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs sm:text-sm font-bold">
                    Email Verification Required
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                    A Firebase verification email was dispatched to{' '}
                    <span className="font-semibold">{currentUser.email || auth?.currentUser?.email}</span>.
                    Please verify your email address to ensure seamless certificate issuance.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  id="resend-verification-email-btn"
                  onClick={handleResendVerification}
                  disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {resendStatus === 'sending' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : resendStatus === 'sent' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Verification Sent!</span>
                    </>
                  ) : (
                    <span>Resend Verification Email</span>
                  )}
                </button>
              </div>
            </div>
          )}
          {/* TAB 1: USER DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome banner - iPhone Glossy Glass with Royal Blue & Yellow Accents */}
              <div className="p-6 rounded-3xl bg-linear-to-r from-blue-700 via-blue-600 to-sky-600 text-white shadow-xl shadow-blue-500/20 backdrop-blur-md border border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
                {/* Gloss specular top sheen */}
                <div className="absolute top-0 inset-x-0 h-1/2 bg-linear-to-b from-white/30 to-transparent pointer-events-none" />

                <div className="space-y-1.5 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide shadow-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                      CSC & Digital Gujarat Center
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-100 hidden sm:inline">
                      {language === 'gu' ? 'શિવ કમ્પ્યુટર' : 'Shiv Computer'}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight drop-shadow-xs">
                    {language === 'gu' ? `નમસ્તે, ${currentUser.name || 'નાગરિક'}` : `Namaste, ${currentUser.name || 'Citizen'}`}
                  </h1>
                  <p className="text-xs text-blue-100 max-w-lg leading-relaxed">
                    {language === 'gu'
                      ? 'તમારા સરકારી પ્રમાણપત્રો, કૃષિ સબસિડીઓ, જમીન રેકોર્ડનું સંચાલન કરો અને અધિકૃત ફોર્મ્સ ડાઉનલોડ કરો.'
                      : 'Manage your government certificates, agricultural subsidies, land records, and download official affidavit formats.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 relative z-10 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('apply')}
                    className="btn-glossy-secondary px-4 py-2.5 rounded-xl text-blue-700 font-bold text-xs flex items-center gap-1.5 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t.userSidebar.applyForService}</span>
                  </button>
                </div>
              </div>

              {/* Status Summary KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    {language === 'gu' ? 'મારી અરજીઓ' : 'My Applications'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                    <AnimatedCounter value={totalUserApps} />
                  </div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                    {language === 'gu' ? 'સબમિટ કરેલ' : 'Submitted'}
                  </div>
                </div>

                <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    {language === 'gu' ? 'પ્રક્રિયા હેઠળ' : 'In Progress'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                    <AnimatedCounter value={pendingUserApps + processingUserApps} />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {language === 'gu' ? 'વિભાગ તપાસ હેઠળ' : 'Under department check'}
                  </div>
                </div>

                <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    {t?.status?.approved || (language === 'gu' ? 'મંજૂર' : 'Approved')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                    <AnimatedCounter value={approvedUserApps} />
                  </div>
                  <div className="text-[11px] text-emerald-500 font-medium mt-1">
                    {language === 'gu' ? 'પ્રમાણપત્ર તૈયાર' : 'Ready for collection'}
                  </div>
                </div>

                <div className="glass-card p-4 rounded-2xl flex flex-col justify-between">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    {language === 'gu' ? 'ચુકવણીઓ' : 'Payments Made'}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-2 flex items-baseline gap-0.5">
                    <span>₹</span>
                    <AnimatedCounter value={userPayments.reduce((acc, p) => acc + p.amount, 0)} />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {userPayments.length} {language === 'gu' ? 'વ્યવહારો' : 'transactions'}
                  </div>
                </div>
              </div>

              {/* CORE CENTER SERVICES (10 Requested Services in Blue/White Glass + Bright Yellow) */}
              <QuickServiceCards onSelectService={(service) => setServiceToApply(service)} />

              {/* Quick Tracker Search */}
              <div className="glass-card p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {language === 'gu' ? 'ત્વરિત અરજી સ્થિતિ ટ્રેકર' : 'Instant Application Status Tracker'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'gu'
                    ? 'તમારી વર્તમાન સ્થિતિ અને સરકારી નોંધો જોવા માટે એપ્લિકેશન ટ્રેકિંગ ID દાખલ કરો.'
                    : 'Enter your Application Tracking ID to view current stage and department remarks.'}
                </p>

                <form onSubmit={handleTrackSubmit} className="flex gap-2 max-w-lg">
                  <input
                    type="text"
                    placeholder={language === 'gu' ? 'અરજી ID દાખલ કરો...' : 'Enter Application ID...'}
                    value={trackSearchId}
                    onChange={(e) => setTrackSearchId(e.target.value)}
                    className="glass-input flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 border border-white/20 transition-all active:scale-95 shrink-0"
                  >
                    <span>{language === 'gu' ? 'ટ્રેક કરો' : 'Track'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {trackedApp && (
                  <div className="mt-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                          {trackedApp.id}
                        </span>
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                          {trackedApp.serviceName}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {language === 'gu' ? 'સ્થિતિ: ' : 'Status: '}<strong className="text-blue-700 dark:text-blue-300">{getStatusLabel(trackedApp.status)}</strong> • {language === 'gu' ? 'સબમિટ તારીખ: ' : 'Submitted: '}{trackedApp.applicationDate}
                      </div>
                      {trackedApp.adminNotes && (
                        <div className="text-xs text-amber-800 dark:text-amber-200/90 mt-1 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-lg border border-amber-200/50">
                          Note from Shiv Computer: {trackedApp.adminNotes}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAppForModal(trackedApp)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold self-start"
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>

              {/* My Applications Quick List */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span>My Active Applications</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('myApplications')}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View All ({userApplications.length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Application ID</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {userApplications.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            You have no submitted applications yet.
                          </td>
                        </tr>
                      ) : (
                        userApplications.map((app) => (
                          <tr
                            key={app.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                            onClick={() => setSelectedAppForModal(app)}
                          >
                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {app.id}
                            </td>
                            <td className="py-3 px-4 font-medium">{app.serviceName}</td>
                            <td className="py-3 px-4 text-slate-500">{app.applicationDate}</td>
                            <td className="py-3 px-4">
                              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(app.status)}`}>
                                {getStatusLabel(app.status)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppForModal(app);
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Official Center & Office Address Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Official Facilitation Center & Support Office</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Char Chok, Keshod
                  </span>
                </div>
                <OfficeAddressCard />
              </div>
            </div>
          )}

          {/* TAB 2: APPLY FOR SERVICE (CATALOG + APPLICATION TRIGGER) */}
          {activeTab === 'apply' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Apply for Citizen & e-Governance Services</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Select a government certificate, travel booking, or assistance service below to submit an online application with Shiv Computer.
                </p>
              </div>

              {/* 10 Highlighted Center Services in Blue/Yellow Glass Cards */}
              <QuickServiceCards onSelectService={(service) => setServiceToApply(service)} />

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-1.5 h-4 rounded-full bg-blue-600" />
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Detailed Services Catalog
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.filter((s) => s.enabled).map((service) => (
                    <div
                      key={service.id}
                      className="service-gloss-card p-5 flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-blue-600 dark:text-sky-400 font-bold mb-1">
                          <span className="truncate pr-2">{service.department}</span>
                          <span className="font-extrabold text-slate-900 dark:text-amber-300 bg-amber-400/15 dark:bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30 shrink-0">
                            ₹{service.fee}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {service.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>

                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                          <div>Processing: <strong className="text-slate-800 dark:text-slate-200">{service.processingTime}</strong></div>
                          <div className="text-[11px] text-slate-400 truncate">
                            Required: {service.requiredDocuments.join(', ')}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setServiceToApply(service)}
                        className="btn-glossy-primary w-full py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MY APPLICATIONS */}
          {activeTab === 'myApplications' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  My Submitted Applications
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Track progress, review submitted documents, and download issued certificates.
                </p>
              </div>

              <div className="space-y-3">
                {userApplications.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                    No applications submitted yet.
                  </div>
                ) : (
                  userApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600">{app.id}</span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{app.serviceName}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Submitted on {app.applicationDate} • Fee: ₹{app.fee} ({app.paymentStatus})
                        </div>
                        {app.adminNotes && (
                          <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/50 mt-1">
                            Note from center: {app.adminNotes}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedAppForModal(app)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-colors"
                        >
                          View Full Details
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AGRICULTURE SERVICES */}
          {activeTab === 'agriculture' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  iKhedut & Agriculture Portal Services
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Government farmer subsidies, wire fencing schemes, solar water pumps, and PM Kisan assistance in Junagadh.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agricultureServices.filter((s) => s.enabled).map((service) => (
                  <div
                    key={service.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-emerald-600 font-semibold mb-1">
                        <span>{service.department}</span>
                        <span className="font-bold text-slate-900 dark:text-white">₹{service.fee}</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                        <div>Processing Time: <strong>{service.processingTime}</strong></div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Required Docs: {service.requiredDocuments.join(', ')}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setServiceToApply(service)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <span>Apply for Scheme</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AVAILABLE SERVICES CATALOG */}
          {activeTab === 'availableServices' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  All Available Services Directory
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Explore government certificates and schemes offered at Shiv Computer.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...services, ...agricultureServices].map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {s.department}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">₹{s.fee}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                        {s.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {s.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setServiceToApply(s)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: DOWNLOAD FORMS */}
          {activeTab === 'downloadForms' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Official Application Forms & Affidavit Templates
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Download standard government forms, print them, fill in your details, or bring them to Shiv Computer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {forms.filter((f) => f.enabled).map((form) => (
                  <div
                    key={form.id}
                    className="glass-card p-5 rounded-2xl flex flex-col justify-between space-y-4 group transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-semibold mb-3">
                        <span className="uppercase px-2.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono text-[10px]">
                          {form.category}
                        </span>
                        <span className="text-slate-400 font-mono">{form.fileSize}</span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-500/20 to-sky-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {form.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {form.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          <span>{language === 'gu' ? 'સરકારી નમૂનો' : 'Govt Approved'}</span>
                        </div>
                        <span className="font-medium text-blue-600 dark:text-blue-400 font-mono">
                          {form.downloadCount} {language === 'gu' ? 'ડાઉનલોડ્સ' : 'downloads'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        incrementFormDownload(form.id);
                        alert(`Downloading official PDF form: ${form.title}`);
                      }}
                      className="w-full py-2.5 px-3.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 border border-white/20 transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>{language === 'gu' ? 'પીડીએફ ફોર્મ ડાઉનલોડ કરો' : 'Download PDF Form'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: UPLOAD DOCUMENTS */}
          {activeTab === 'uploadDocs' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Document Locker & Upload Portal
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Upload required identification, ration cards, land extracts, and passport photos for your applications.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  Attach New Document to an Application
                </div>

                <div className="space-y-3">
                  {userApplications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No applications submitted yet. Apply for a service to upload documents.
                    </div>
                  ) : (
                    userApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-600">{app.id}</span>
                            <span className="font-semibold text-xs text-slate-900 dark:text-white">{app.serviceName}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Currently has {app.uploadedDocuments.length} uploaded files
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedAppForModal(app)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center gap-1.5 self-start sm:self-center"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Manage & Upload Docs</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: APPLICATION STATUS */}
          {activeTab === 'applicationStatus' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Track Application Status & Milestones
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Live verification tracker with official department timestamps.
                </p>
              </div>

              <div className="space-y-4">
                {userApplications.length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                    No active applications to track. Apply for a service to view live progress milestones.
                  </div>
                ) : (
                  userApplications.map((app) => (
                    <div
                      key={app.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <span className="font-mono text-xs font-bold text-blue-600">{app.id}</span>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">{app.serviceName}</h3>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border self-start ${getStatusBadge(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </div>

                      {/* Progress steps */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                          <div className="font-semibold text-emerald-800 dark:text-emerald-300">1. Submitted</div>
                          <div className="text-[10px] text-slate-400">{app.applicationDate}</div>
                        </div>

                        <div className={`p-3 rounded-xl border ${
                          app.status !== 'Pending'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}>
                          <FileCheck className="w-4 h-4 mx-auto mb-1" />
                          <div>2. Docs Verified</div>
                          <div className="text-[10px] text-slate-400">{app.uploadedDocuments.length} docs</div>
                        </div>

                        <div className={`p-3 rounded-xl border ${
                          app.status === 'Processing' || app.status === 'Approved' || app.status === 'Completed'
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}>
                          <Clock className="w-4 h-4 mx-auto mb-1" />
                          <div>3. Govt Processing</div>
                          <div className="text-[10px] text-slate-400">Department</div>
                        </div>

                        <div className={`p-3 rounded-xl border ${
                          app.status === 'Approved' || app.status === 'Completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                            : app.status === 'Rejected'
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                        }`}>
                          <Check className="w-4 h-4 mx-auto mb-1" />
                          <div>{language === 'gu' ? '૪. પરિણામ' : '4. Outcome'}</div>
                          <div className="text-[10px] text-slate-400">{getStatusLabel(app.status)}</div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedAppForModal(app)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Inspect Application Documents & Remarks →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 9: PAYMENT HISTORY */}
          {activeTab === 'paymentHistory' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Payment History & Official Receipts
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Review transaction receipts for services processed at Shiv Computer.
                </p>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Receipt ID</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {userPayments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No payment transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        userPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-mono font-bold text-blue-600">{p.id}</td>
                            <td className="py-3 px-4 font-medium">{p.serviceName}</td>
                            <td className="py-3 px-4 text-slate-500 text-xs">{p.date}</td>
                            <td className="py-3 px-4">{p.method}</td>
                            <td className="py-3 px-4 font-bold text-emerald-600">₹{p.amount}</td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {p.status === 'Successful' ? (language === 'gu' ? 'સફળ' : 'Successful') : (language === 'gu' ? 'બાકી' : 'Pending')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => alert(`Downloading payment receipt ${p.id} for ₹${p.amount}`)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Print Receipt"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Official Announcements & Deadlines
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Government scheme notices and center updates published by Shiv Computer.
                </p>
              </div>

              <div className="space-y-3">
                {notifications.filter((n) => n.targetRole === 'all' || n.targetRole === 'user').length === 0 ? (
                  <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                    No announcements or notifications available at this time.
                  </div>
                ) : (
                  notifications
                    .filter((n) => n.targetRole === 'all' || n.targetRole === 'user')
                    .map((n) => (
                      <div
                        key={n.id}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-3.5"
                      >
                        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                          <Bell className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                            <span className="text-[10px] text-slate-400">{n.date}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB 11: HELP & SUPPORT */}
          {activeTab === 'helpSupport' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Helpdesk & Customer Support
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Get in touch with Shiv Computer experts for certificate corrections or scheme assistance.
                </p>
              </div>

              {/* Enhanced Office Address & Owner Contact Card */}
              <OfficeAddressCard />

              {/* Submit query */}
              <form
                onSubmit={handleSendInquiry}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs"
              >
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    Submit Query / Request Callback
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subject / Scheme Name
                    </label>
                    <input
                      type="text"
                      required
                      value={inquirySubject}
                      onChange={(e) => setInquirySubject(e.target.value)}
                      placeholder="Enter subject or scheme name"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Message / Question
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      placeholder="Describe your query..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={inquirySent}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{inquirySent ? 'Submitting...' : 'Send Message'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

          {/* TAB 12: MY PROFILE */}
          {activeTab === 'myProfile' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Citizen Profile & Contact Info
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Update your personal details used for prefilling online government forms.
                </p>
              </div>

              <form
                onSubmit={handleSaveProfile}
                className="max-w-xl p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm"
              >
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (As per Aadhaar)
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Registered Mobile
                    </label>
                    <input
                      type="text"
                      required
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Username (Unique ID)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={currentUser.username ? `@${currentUser.username}` : '@user'}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Residential / Village Address
                  </label>
                  <textarea
                    rows={2}
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {profileSavedNotice && (
                    <span className="text-xs text-emerald-600 font-semibold animate-in fade-in">
                      Profile updated successfully!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>

              {/* Account Security & Password Recovery */}
              <div
                id="user-account-security-card"
                className="max-w-xl p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Account Security & Password
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Firebase Authentication password recovery & credential management
                    </p>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  Need to change or recover your password? Dispatch a secure password reset link to your registered email address ({currentUser.email || 'your email'}) using Firebase Auth.
                </p>

                {resetStatus && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      resetStatus.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    {resetStatus.type === 'success' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <span>{resetStatus.message}</span>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="button"
                    id="user-send-password-reset-btn"
                    onClick={handleSendProfilePasswordReset}
                    disabled={isResettingPassword || !currentUser.email}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors disabled:opacity-50"
                  >
                    {isResettingPassword ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Firebase Reset Link...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Send Password Reset Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Application Details Modal */}
      {selectedAppForModal && (
        <ApplicationDetailsModal
          application={selectedAppForModal}
          role="user"
          onClose={() => setSelectedAppForModal(null)}
        />
      )}

      {/* Apply For Service Modal */}
      {serviceToApply && (
        <ApplyServiceModal
          isOpen={!!serviceToApply}
          service={serviceToApply}
          onClose={() => setServiceToApply(null)}
          onSuccess={(createdApp) => {
            setSelectedAppForModal(createdApp);
            setActiveTab('myApplications');
          }}
        />
      )}
    </div>
  );
};
