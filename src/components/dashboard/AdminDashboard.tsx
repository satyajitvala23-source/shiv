import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Layers,
  Sprout,
  FileText,
  Users,
  FolderOpen,
  CreditCard,
  Bell,
  BarChart3,
  Globe,
  UserCog,
  Settings,
  LogOut,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  IndianRupee,
  Calendar,
  Save,
  Send,
  Power,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  Application,
  ApplicationStatus,
  CustomerUser,
  FormTemplate,
  ServiceItem,
} from '../../types';
import { DashboardHeader } from './DashboardHeader';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';
import { ServiceModal } from './ServiceModal';
import { FormModal } from './FormModal';
import { OfficeAddressCard } from './OfficeAddressCard';
import { AnimatedCounter } from '../AnimatedCounter';

type AdminTab =
  | 'dashboard'
  | 'applications'
  | 'services'
  | 'agricultureServices'
  | 'forms'
  | 'customers'
  | 'documents'
  | 'payments'
  | 'notifications'
  | 'reports'
  | 'websiteContent'
  | 'userManagement'
  | 'adminSettings';

export const AdminDashboard: React.FC = () => {
  const {
    t,
    language,
    logout,
    applications,
    services,
    agricultureServices,
    forms,
    users,
    payments,
    notifications,
    websiteContent,
    updateWebsiteContent,
    deleteService,
    toggleServiceEnabled,
    addService,
    updateService,
    deleteForm,
    toggleFormEnabled,
    addForm,
    updateForm,
    incrementFormDownload,
    toggleUserStatus,
    updateUser,
    createNotification,
    deleteNotification,
    updateApplicationStatus,
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

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [selectedAppForModal, setSelectedAppForModal] = useState<Application | null>(null);
  const [serviceModalState, setServiceModalState] = useState<{
    isOpen: boolean;
    serviceToEdit: ServiceItem | null;
    category: 'general' | 'agriculture';
  }>({
    isOpen: false,
    serviceToEdit: null,
    category: 'general',
  });
  const [formModalState, setFormModalState] = useState<{
    isOpen: boolean;
    formToEdit: FormTemplate | null;
  }>({
    isOpen: false,
    formToEdit: null,
  });

  // Filters and Searches
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');

  // Notifications creator state
  const [newNotifTitle, setNewNotifTitle] = useState('');
  const [newNotifMessage, setNewNotifMessage] = useState('');
  const [newNotifTarget, setNewNotifTarget] = useState<'all' | 'admin' | 'user'>('all');

  // Website Content editing state
  const [editableWeb, setEditableWeb] = useState(websiteContent);
  const [isWebSaved, setIsWebSaved] = useState(false);

  // Selected customer for drill-down profile inspection
  const [inspectedUser, setInspectedUser] = useState<CustomerUser | null>(null);

  // KPI Calculations & Requirement 4 Statistics
  const totalApps = applications.length;
  const pendingApps = applications.filter((a) => a.status === 'Pending').length;
  const processingApps = applications.filter((a) => a.status === 'Processing').length;
  const approvedApps = applications.filter((a) => a.status === 'Approved' || a.status === 'Completed').length;
  const rejectedApps = applications.filter((a) => a.status === 'Rejected').length;
  const totalRevenue = payments
    .filter((p) => p.status === 'Successful')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Dynamic statistics from existing Firestore collections
  const totalUsers = users.length;
  const totalDocuments = forms.length + applications.reduce((acc, a) => acc + (a.uploadedDocuments?.length || 0), 0);
  const totalDownloads = forms.reduce((acc, f) => acc + (f.downloadCount || 0), 0);
  const totalApplications = applications.length;

  // Application filtering
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.serviceName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.applicantPhone.includes(appSearch);
    const matchesStatus = appStatusFilter === 'all' || app.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // User filtering
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(userSearch.toLowerCase())) ||
      u.phone.includes(userSearch)
  );

  // Payment filtering
  const filteredPayments = payments.filter(
    (p) =>
      p.id.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.applicantName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.serviceName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      p.transactionRef.toLowerCase().includes(paymentSearch.toLowerCase())
  );

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotifTitle.trim() || !newNotifMessage.trim()) return;
    createNotification({
      title: newNotifTitle.trim(),
      message: newNotifMessage.trim(),
      targetRole: newNotifTarget,
      type: 'info',
    });
    setNewNotifTitle('');
    setNewNotifMessage('');
  };

  const handleSaveWebContent = (e: React.FormEvent) => {
    e.preventDefault();
    updateWebsiteContent(editableWeb);
    setIsWebSaved(true);
    setTimeout(() => setIsWebSaved(false), 2500);
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
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Rejected':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Nav Items list matching exact prompt requirements
  const navItems = [
    { id: 'dashboard' as AdminTab, label: t.adminSidebar.dashboard, icon: LayoutDashboard },
    { id: 'applications' as AdminTab, label: t.adminSidebar.applications, icon: FileSpreadsheet, badge: pendingApps },
    { id: 'services' as AdminTab, label: t.adminSidebar.services, icon: Layers },
    { id: 'agricultureServices' as AdminTab, label: t.adminSidebar.agricultureServices, icon: Sprout },
    { id: 'forms' as AdminTab, label: t.adminSidebar.forms, icon: FileText },
    { id: 'customers' as AdminTab, label: t.adminSidebar.customers, icon: Users },
    { id: 'documents' as AdminTab, label: t.adminSidebar.documents, icon: FolderOpen },
    { id: 'payments' as AdminTab, label: t.adminSidebar.payments, icon: CreditCard },
    { id: 'notifications' as AdminTab, label: t.adminSidebar.notifications, icon: Bell },
    { id: 'reports' as AdminTab, label: t.adminSidebar.reports, icon: BarChart3 },
    { id: 'websiteContent' as AdminTab, label: t.adminSidebar.websiteContent, icon: Globe },
    { id: 'userManagement' as AdminTab, label: t.adminSidebar.userManagement, icon: UserCog },
    { id: 'adminSettings' as AdminTab, label: t.adminSidebar.adminSettings, icon: Settings },
  ];

  return (
    <div id="admin-dashboard-container" className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-white relative z-10">
      {/* Header */}
      <DashboardHeader
        role="admin"
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          id="admin-sidebar"
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
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold leading-none mt-0.5">
                  {language === 'gu' ? 'એડમિન કંટ્રોલ પેનલ' : 'Admin Control Panel'}
                </span>
              </div>
            </div>

            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {language === 'gu' ? 'મુખ્ય મેનૂ' : 'Master Controls'}
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
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
                        isActive ? 'bg-white text-blue-700' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
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
              id="admin-sidebar-logout-btn"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50/80 dark:hover:bg-blue-900/30 transition-colors active:scale-98"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.adminSidebar.logout}</span>
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
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {language === 'gu' ? 'એડમિનિસ્ટ્રેટર કમાન્ડ સેન્ટર' : 'Administrator Command Center'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'gu'
                      ? 'શિવ કમ્પ્યુટર માટે રીઅલ-ટાઇમ આંકડા, અરજીઓની કતાર અને સેવા સ્થિતિ.'
                      : 'Real-time metrics, citizen applications queue, and service health for Shiv Computer.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('applications')}
                    className="px-3.5 py-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all border border-white/20"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{language === 'gu' ? 'બધી અરજીઓ જુઓ' : 'View All Applications'}</span>
                  </button>
                </div>
              </div>

              {/* Requirement 4: Primary Dynamic Statistics Cards from Firestore */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{language === 'gu' ? 'મુખ્ય આંકડાઓ' : 'Core Key Performance Indicators'}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Total Users */}
                  <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {language === 'gu' ? 'કુલ વપરાશકર્તાઓ' : 'Total Users'}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                      <AnimatedCounter value={totalUsers} />
                    </div>
                    <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                      {language === 'gu' ? 'નોંધાયેલ નાગરિક એકાઉન્ટ્સ' : 'Registered citizen profiles'}
                    </div>
                  </div>

                  {/* Total Documents */}
                  <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {language === 'gu' ? 'કુલ દસ્તાવેજો' : 'Total Documents'}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                        <FolderOpen className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                      <AnimatedCounter value={totalDocuments} />
                    </div>
                    <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
                      {language === 'gu' ? 'ફોર્મ્સ અને અપલોડ કરેલા કાગળો' : 'Forms & uploaded files'}
                    </div>
                  </div>

                  {/* Total Downloads */}
                  <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {language === 'gu' ? 'કુલ ડાઉનલોડ' : 'Total Downloads'}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <Download className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-3">
                      <AnimatedCounter value={totalDownloads} />
                    </div>
                    <div className="text-[11px] text-emerald-600/90 dark:text-emerald-400/90 font-medium mt-1">
                      {language === 'gu' ? 'સરકારી ફોર્મ નકલ' : 'Official PDF downloads'}
                    </div>
                  </div>

                  {/* Applications */}
                  <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {language === 'gu' ? 'અરજીઓ' : 'Applications'}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                      <AnimatedCounter value={totalApplications} />
                    </div>
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                      {language === 'gu' ? 'કુલ સબમિટ થયેલ અરજીઓ' : 'Total citizen requests'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Breakdown & Revenue Secondary Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="glass-card p-4 rounded-2xl">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    {t?.status?.pending || (language === 'gu' ? 'બાકી' : 'Pending')}
                  </div>
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    <AnimatedCounter value={pendingApps} />
                  </div>
                  <div className="text-[11px] text-amber-500 mt-0.5">{language === 'gu' ? 'તપાસ બાકી' : 'Requires Verification'}</div>
                </div>

                <div className="glass-card p-4 rounded-2xl">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    {t?.status?.processing || (language === 'gu' ? 'પ્રક્રિયા હેઠળ' : 'Processing')}
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    <AnimatedCounter value={processingApps} />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{language === 'gu' ? 'સરકારી વિભાગમાં' : 'With Govt Office'}</div>
                </div>

                <div className="glass-card p-4 rounded-2xl">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    {t?.status?.approved || (language === 'gu' ? 'મંજૂર' : 'Approved')}
                  </div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    <AnimatedCounter value={approvedApps} />
                  </div>
                  <div className="text-[11px] text-emerald-500 mt-0.5">{language === 'gu' ? 'પ્રમાણપત્ર તૈયાર' : 'Certificate Issued'}</div>
                </div>

                <div className="glass-card p-4 rounded-2xl">
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    {language === 'gu' ? 'કુલ આવક' : 'Total Revenue'}
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1 flex items-baseline gap-0.5">
                    <span>₹</span>
                    <AnimatedCounter value={totalRevenue} />
                  </div>
                  <div className="text-[11px] text-emerald-500 mt-0.5">{language === 'gu' ? 'UPI / રોકડ' : 'Paid via UPI / Cash'}</div>
                </div>
              </div>

              {/* Second row: Quick Services & Forms overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>{language === 'gu' ? 'નાગરિક અને કૃષિ સેવાઓ' : 'Citizen & Agri Services'}</span>
                    </h3>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{services.length + agricultureServices.length} Total</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Active services on portal: {services.filter((s) => s.enabled).length} General and {agricultureServices.filter((s) => s.enabled).length} iKhedut agriculture schemes.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('services')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <span>{language === 'gu' ? 'સેવાઓનું સંચાલન કરો →' : 'Manage Services Catalog →'}</span>
                  </button>
                </div>

                <div className="glass-card p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'gu' ? 'ફોર્મ્સ ભંડાર' : 'Forms Repository'}</span>
                    </h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{forms.length} Templates</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Official affidavits and application forms downloaded {forms.reduce((acc, f) => acc + f.downloadCount, 0)} times by citizens.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forms')}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <span>{language === 'gu' ? 'ડાઉનલોડેબલ ફોર્મ્સ જુઓ →' : 'Manage Downloadable Forms →'}</span>
                  </button>
                </div>

                <div className="glass-card p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-600" />
                      <span>{language === 'gu' ? 'જાહેરાતો' : 'Broadcast Announcements'}</span>
                    </h3>
                    <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{notifications.length} Active</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Send push notices and portal announcements to users regarding scheme dates and deadlines.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('notifications')}
                    className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <span>{language === 'gu' ? 'નવી જાહેરાત બનાવો →' : 'Create Announcement →'}</span>
                  </button>
                </div>
              </div>

              {/* Recent Applications Quick Queue */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                    <span>{language === 'gu' ? 'તાજેતરની અરજીઓ (સમીક્ષા કરવા ક્લિક કરો)' : 'Recent Applications (Click to Review)'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('applications')}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All {applications.length}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Application ID</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Applicant</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {applications.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No applications submitted yet. Real citizen applications will appear here.
                          </td>
                        </tr>
                      ) : (
                        applications.slice(0, 5).map((app) => (
                          <tr
                            key={app.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedAppForModal(app)}
                          >
                            <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {app.id}
                            </td>
                            <td className="py-3 px-4 font-medium max-w-xs truncate">
                              {app.serviceName}
                            </td>
                            <td className="py-3 px-4">
                              <div>{app.applicantName}</div>
                              <div className="text-[11px] text-slate-400">{app.applicantPhone}</div>
                            </td>
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
                                className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Official Center Profile & Address Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Official Facilitation Center & Owner Profile</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Char Chok, Keshod
                  </span>
                </div>
                <OfficeAddressCard highlightAdmin={true} />
              </div>
            </div>
          )}

          {/* TAB 2: APPLICATIONS (FULL APPLICATION MANAGEMENT) */}
          {activeTab === 'applications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Citizen Applications Management
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Review, approve, reject, verify documents, and attach administrator notes.
                  </p>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by Application ID, Applicant Name, Service, or Phone..."
                    value={appSearch}
                    onChange={(e) => setAppSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={appStatusFilter}
                    onChange={(e) => setAppStatusFilter(e.target.value)}
                    className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                  >
                    <option value="all">{language === 'gu' ? 'બધી સ્થિતિ' : 'All Statuses'} ({applications.length})</option>
                    <option value="Pending">{t?.status?.pending || (language === 'gu' ? 'બાકી' : 'Pending')} ({applications.filter((a) => a.status === 'Pending').length})</option>
                    <option value="Processing">{t?.status?.processing || (language === 'gu' ? 'પ્રક્રિયા હેઠળ' : 'Processing')} ({applications.filter((a) => a.status === 'Processing').length})</option>
                    <option value="Document Required">{t?.status?.documentRequired || (language === 'gu' ? 'દસ્તાવેજ જરૂરી' : 'Document Required')} ({applications.filter((a) => a.status === 'Document Required').length})</option>
                    <option value="Approved">{t?.status?.approved || (language === 'gu' ? 'મંજૂર' : 'Approved')} ({applications.filter((a) => a.status === 'Approved').length})</option>
                    <option value="Rejected">{t?.status?.rejected || (language === 'gu' ? 'નામંજૂર' : 'Rejected')} ({applications.filter((a) => a.status === 'Rejected').length})</option>
                    <option value="Completed">{t?.status?.completed || (language === 'gu' ? 'પૂર્ણ થયેલ' : 'Completed')} ({applications.filter((a) => a.status === 'Completed').length})</option>
                  </select>
                </div>
              </div>

              {/* Applications Table */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Application ID</th>
                        <th className="py-3.5 px-4">Service Details</th>
                        <th className="py-3.5 px-4">Applicant</th>
                        <th className="py-3.5 px-4">Date</th>
                        <th className="py-3.5 px-4">Docs</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {filteredApplications.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No applications matching filter criteria
                          </td>
                        </tr>
                      ) : (
                        filteredApplications.map((app) => (
                          <tr
                            key={app.id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                              {app.id}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-semibold">{app.serviceName}</div>
                              <div className="text-[11px] text-slate-400">
                                Fee: ₹{app.fee} • {app.category === 'agriculture' ? 'Agriculture Scheme' : 'General Service'}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-medium">{app.applicantName}</div>
                              <div className="text-[11px] text-slate-400">{app.applicantPhone}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-xs">
                              {app.applicationDate}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-medium">
                                {app.uploadedDocuments.length} files
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(app.status)}`}>
                                {getStatusLabel(app.status)}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedAppForModal(app)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 font-semibold text-xs transition-colors"
                              >
                                Review & Manage
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

          {/* TAB 3: SERVICES MANAGEMENT */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    General Services Management
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Add, edit, delete, or toggle availability of e-Governance services.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setServiceModalState({
                      isOpen: true,
                      serviceToEdit: null,
                      category: 'general',
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between ${
                      service.enabled
                        ? 'border-slate-200 dark:border-slate-800 shadow-xs'
                        : 'border-slate-200/60 dark:border-slate-800/60 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                          {service.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleServiceEnabled(service.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            service.enabled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500 border-slate-300'
                          }`}
                        >
                          {service.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Fee:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">₹{service.fee}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Processing:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{service.processingTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">
                        {service.requiredDocuments.length} required docs
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setServiceModalState({
                              isOpen: true,
                              serviceToEdit: service,
                              category: 'general',
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteService(service.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AGRICULTURE SERVICES MANAGEMENT */}
          {activeTab === 'agricultureServices' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Agriculture & iKhedut Services
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Manage farmer subsidies, wire fencing schemes, solar pumps, and PM Kisan assistance.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setServiceModalState({
                      isOpen: true,
                      serviceToEdit: null,
                      category: 'agriculture',
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Agriculture Scheme</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agricultureServices.map((service) => (
                  <div
                    key={service.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          {service.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleServiceEnabled(service.id)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            service.enabled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-300'
                          }`}
                        >
                          {service.enabled ? 'Enabled' : 'Disabled'}
                        </button>
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {service.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Application Fee:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">₹{service.fee}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Processing Time:</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{service.processingTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">
                        {service.requiredDocuments.length} required docs
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setServiceModalState({
                              isOpen: true,
                              serviceToEdit: service,
                              category: 'agriculture',
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Scheme"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteService(service.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          title="Delete Scheme"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FORMS MANAGEMENT */}
          {activeTab === 'forms' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Downloadable Forms Management
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Upload, replace, enable, or disable official PDF forms for citizens.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormModalState({ isOpen: true, formToEdit: null })}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Form Template</span>
                </button>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Form Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">File Size</th>
                        <th className="py-3 px-4">Downloads</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {forms.map((form) => (
                        <tr key={form.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4">
                            <div className="font-semibold">{form.title}</div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{form.description}</div>
                          </td>
                          <td className="py-3 px-4 uppercase text-[11px] font-semibold text-slate-500">
                            {form.category}
                          </td>
                          <td className="py-3 px-4 text-slate-500">{form.fileSize}</td>
                          <td className="py-3 px-4 font-bold text-blue-600">{form.downloadCount}</td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => toggleFormEnabled(form.id)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                form.enabled
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-300'
                              }`}
                            >
                              {form.enabled ? 'Available' : 'Disabled'}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  incrementFormDownload(form.id);
                                  alert(`Downloading form: ${form.title}`);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Download Form"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setFormModalState({ isOpen: true, formToEdit: form })}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit Form"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteForm(form.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                title="Delete Form"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMERS / USERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Customer Directory & User Accounts
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    View user profiles, applications history, payment records, and account statuses.
                  </p>
                </div>
              </div>

              {/* User Search Bar */}
              <div className="flex items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <Search className="w-4 h-4 text-slate-400 ml-2" />
                <input
                  type="text"
                  placeholder="Search citizens by name, email, or mobile..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-3 pr-4 py-1.5 text-xs sm:text-sm bg-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                    No registered citizens found. Real registered users will appear here.
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const userApps = applications.filter((a) => a.applicantId === user.id);
                    const userPayments = payments.filter((p) => p.applicantId === user.id);
                    return (
                      <div
                        key={user.id}
                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-sm">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                    {user.name}
                                  </h3>
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                    user.role === 'admin'
                                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                  }`}>
                                    {user.role === 'admin' ? 'Admin' : 'User'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 flex-wrap">
                                  <span>{user.email}</span>
                                  {user.username && (
                                    <span className="font-mono text-blue-600 dark:text-blue-400 font-medium">
                                      @{user.username}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleUserStatus(user.id)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                                user.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {user.status}
                            </button>
                          </div>

                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                            <div>Phone: {user.phone || 'Not provided'}</div>
                            <div className="truncate">Address: {user.address || 'Keshod, Gujarat'}</div>
                            <div className="text-[11px] text-slate-400">Registered: {user.joinedDate || 'Recently'}</div>
                          </div>

                          <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 grid grid-cols-2 gap-2 text-center text-xs">
                            <div>
                              <div className="text-slate-400 text-[10px]">Applications</div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">{userApps.length}</div>
                            </div>
                            <div>
                              <div className="text-slate-400 text-[10px]">Total Paid</div>
                              <div className="font-bold text-emerald-600">₹{userPayments.reduce((a, c) => a + c.amount, 0)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              const newName = prompt('Update user full name:', user.name);
                              if (newName && newName.trim()) {
                                updateUser(user.id, { name: newName.trim() });
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Edit Info
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
          </div>
          )}

          {/* TAB 7: DOCUMENTS VERIFICATION QUEUE */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Document Verification Hub
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Inspect applicant Aadhaar, 7/12 land records, affidavits, and mark verification status.
                </p>
              </div>

              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400">
                    No documents pending verification. Real uploaded documents will appear here.
                  </div>
                ) : (
                  applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600">{app.id}</span>
                          <span className="font-semibold text-sm text-slate-900 dark:text-white">{app.serviceName}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Applicant: <strong>{app.applicantName}</strong> ({app.applicantPhone})
                        </div>
                      </div>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border self-start ${getStatusBadge(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                      {app.uploadedDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div className="overflow-hidden pr-2">
                            <div className="font-medium text-xs text-slate-800 dark:text-slate-200 truncate">
                              {doc.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {doc.size} • {doc.date}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                doc.status === 'Verified'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.status === 'Needs Correction'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {doc.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => alert(`Opening file preview for: ${doc.name}`)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                              title="Inspect File"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAppForModal(app)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Open Application Review Controls →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          )}

          {/* TAB 8: PAYMENTS & REVENUE */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Payments & Revenue Accounting
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Track cash collections, online UPI settlements, and application fee invoices.
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">Total Collected Revenue</div>
                    <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200">₹{totalRevenue}</div>
                  </div>
                </div>
              </div>

              {/* Payment Search */}
              <div className="flex items-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <Search className="w-4 h-4 text-slate-400 ml-2" />
                <input
                  type="text"
                  placeholder="Search by Payment ID, Applicant, Service, or Transaction Reference..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="w-full pl-3 pr-4 py-1.5 text-xs sm:text-sm bg-transparent outline-none"
                />
              </div>

              {/* Payments Table */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Receipt ID</th>
                        <th className="py-3 px-4">Applicant</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No payment records found. Real payment receipts will appear here.
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-mono font-bold text-blue-600">{p.id}</td>
                            <td className="py-3 px-4 font-medium">{p.applicantName}</td>
                            <td className="py-3 px-4">{p.serviceName}</td>
                            <td className="py-3 px-4 text-slate-500 text-xs">{p.date}</td>
                            <td className="py-3 px-4 font-medium">{p.method}</td>
                            <td className="py-3 px-4 font-bold text-emerald-600">₹{p.amount}</td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {p.status}
                              </span>
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

          {/* TAB 9: NOTIFICATIONS & ANNOUNCEMENTS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Notifications & Broadcast Announcements
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Send important scheme deadlines and alerts to citizens and staff.
                </p>
              </div>

              {/* Notification Creator Form */}
              <form
                onSubmit={handleCreateNotification}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm"
              >
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Broadcast New Notice
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newNotifTitle}
                      onChange={(e) => setNewNotifTitle(e.target.value)}
                      placeholder="Enter announcement or update details"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Role
                    </label>
                    <select
                      value={newNotifTarget}
                      onChange={(e) => setNewNotifTarget(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    >
                      <option value="all">All (Admin + Citizens)</option>
                      <option value="user">Citizens Only</option>
                      <option value="admin">Administrators Only</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Announcement Message
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newNotifMessage}
                    onChange={(e) => setNewNotifMessage(e.target.value)}
                    placeholder="Enter the full announcement text for citizens..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Broadcast Notice</span>
                  </button>
                </div>
              </form>

              {/* Notifications History List */}
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3">
                <div className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                  Broadcast History ({notifications.length})
                </div>

                <div className="space-y-2">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No notifications or broadcast announcements sent yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 flex items-start justify-between gap-3"
                      >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold uppercase">
                            {n.targetRole}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="text-[10px] text-slate-400">{n.date}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteNotification(n.id)}
                        className="text-slate-400 hover:text-amber-600 p-1"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          )}

          {/* TAB 10: REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Shiv Computer Performance & Reports
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Daily, monthly, and service-wise application conversion breakdowns.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Generating full CSV export of applications and revenue...')}
                  className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV Report</span>
                </button>
              </div>

              {/* Reports Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Breakdown */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Application Status Distribution</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-emerald-600">Approved & Completed</span>
                        <span className="font-bold">{approvedApps} ({Math.round((approvedApps / (totalApps || 1)) * 100)}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${(approvedApps / (totalApps || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-blue-600">Processing with Departments</span>
                        <span className="font-bold">{processingApps} ({Math.round((processingApps / (totalApps || 1)) * 100)}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${(processingApps / (totalApps || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-amber-600">Pending Review</span>
                        <span className="font-bold">{pendingApps} ({Math.round((pendingApps / (totalApps || 1)) * 100)}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${(pendingApps / (totalApps || 1)) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-slate-600 dark:text-slate-400">Rejected / Duplicate</span>
                        <span className="font-bold">{rejectedApps} ({Math.round((rejectedApps / (totalApps || 1)) * 100)}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-slate-400 dark:bg-slate-600 rounded-full"
                          style={{ width: `${(rejectedApps / (totalApps || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Category Split */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <span>General vs. Agriculture Applications</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/50">
                      <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {applications.filter((a) => a.category === 'general').length}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                        General Citizen Services
                      </div>
                      <div className="text-[11px] text-slate-400">PAN, Income, Ration, Caste</div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50">
                      <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                        {applications.filter((a) => a.category === 'agriculture').length}
                      </div>
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                        Agriculture Schemes
                      </div>
                      <div className="text-[11px] text-slate-400">Tar Fencing, Solar, PM Kisan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: WEBSITE CONTENT MANAGEMENT */}
          {activeTab === 'websiteContent' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Public Website Content & Center Details
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Modify homepage notices, working hours, contact info, and center about us profile.
                  </p>
                </div>
              </div>

              {/* Official Center & Office Address Card (Live Public View) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Official Center & Owner Contact Card (Live Display)</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Keshod, Gujarat
                  </span>
                </div>
                <OfficeAddressCard highlightAdmin={true} />
              </div>

              <form onSubmit={handleSaveWebContent} className="space-y-4 text-xs sm:text-sm">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    Homepage Branding & Titles
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Header Title
                    </label>
                    <input
                      type="text"
                      value={editableWeb.homeHeading}
                      onChange={(e) => setEditableWeb({ ...editableWeb, homeHeading: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Subheading / Mission
                    </label>
                    <input
                      type="text"
                      value={editableWeb.homeSubheading}
                      onChange={(e) => setEditableWeb({ ...editableWeb, homeSubheading: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Working Hours
                      </label>
                      <input
                        type="text"
                        value={editableWeb.workingHours}
                        onChange={(e) => setEditableWeb({ ...editableWeb, workingHours: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Contact Helpline & Phone
                      </label>
                      <input
                        type="text"
                        value={editableWeb.contactPhone}
                        onChange={(e) => setEditableWeb({ ...editableWeb, contactPhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Physical Center Address (Char Chok, Keshod)
                    </label>
                    <input
                      type="text"
                      value={editableWeb.address}
                      onChange={(e) => setEditableWeb({ ...editableWeb, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Google Maps Location URL
                    </label>
                    <input
                      type="url"
                      value={editableWeb.googleMapsUrl || ''}
                      onChange={(e) => setEditableWeb({ ...editableWeb, googleMapsUrl: e.target.value })}
                      placeholder="https://maps.app.goo.gl/Qp12UPnnrWvBTeQQ8?g_st=ac8"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      About Us Description
                    </label>
                    <textarea
                      rows={3}
                      value={editableWeb.aboutUs}
                      onChange={(e) => setEditableWeb({ ...editableWeb, aboutUs: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {isWebSaved && (
                      <span className="text-xs text-emerald-600 font-semibold animate-in fade-in">
                        Website content saved successfully!
                      </span>
                    )}
                    <button
                      type="submit"
                      className="ml-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Website Content</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 12: USERS MANAGEMENT & TEAM */}
          {activeTab === 'userManagement' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Users & Administrative Privileges
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Control roles, staff accounts, and client authentication statuses.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  Administrative Personnel (Full Access)
                </div>

                <div className="space-y-2">
                  {users.filter((u) => u.role === 'admin').length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No additional administrator accounts configured in directory.
                    </div>
                  ) : (
                    users
                      .filter((u) => u.role === 'admin')
                      .map((adminUser) => (
                        <div
                          key={adminUser.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                              {adminUser.name.charAt(0) || 'A'}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-slate-900 dark:text-white">
                                {adminUser.name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {adminUser.email} • Full Permissions
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Super Admin
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 13: ADMIN SETTINGS */}
          {activeTab === 'adminSettings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Admin System Configuration
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  System settings, offline data cache, and future Firebase/PHP connection readiness.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs sm:text-sm">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  Frontend Role Enforcement Architecture
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  This system enforces strict role-based separation at the client view layer. As requested, all Admin controls (Add/Edit/Delete, User Management, Revenue reports) are isolated exclusively to this Administrator view.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs space-y-1">
                  <div className="font-bold">Production Firebase Persistence Architecture:</div>
                  <div>
                    Real application submissions, citizen users, services, and transactions are synchronized in real-time with Google Cloud Firestore.
                  </div>
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
          role="admin"
          onClose={() => setSelectedAppForModal(null)}
        />
      )}

      {/* Service Add/Edit Modal */}
      {serviceModalState.isOpen && (
        <ServiceModal
          isOpen={serviceModalState.isOpen}
          serviceToEdit={serviceModalState.serviceToEdit}
          defaultCategory={serviceModalState.category}
          onClose={() => setServiceModalState({ isOpen: false, serviceToEdit: null, category: 'general' })}
          onSave={(newOrUpdated) => {
            if (serviceModalState.serviceToEdit) {
              updateService(serviceModalState.serviceToEdit.id, newOrUpdated);
            } else {
              addService(newOrUpdated);
            }
          }}
        />
      )}

      {/* Form Add/Edit Modal */}
      {formModalState.isOpen && (
        <FormModal
          isOpen={formModalState.isOpen}
          formToEdit={formModalState.formToEdit}
          onClose={() => setFormModalState({ isOpen: false, formToEdit: null })}
          onSave={(newOrUpdated) => {
            if (formModalState.formToEdit) {
              updateForm(formModalState.formToEdit.id, newOrUpdated);
            } else {
              addForm(newOrUpdated);
            }
          }}
        />
      )}
    </div>
  );
};
