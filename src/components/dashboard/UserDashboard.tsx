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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Application, ApplicationStatus, FormTemplate, ServiceItem } from '../../types';
import { DashboardHeader } from './DashboardHeader';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';
import { ApplyServiceModal } from './ApplyServiceModal';

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

  // Support inquiry state
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySent, setInquirySent] = useState(false);

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
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
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
    <div id="user-dashboard-container" className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
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
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Scrollable Navigation */}
          <div className="p-3 overflow-y-auto space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Citizen Portal
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
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
          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              id="user-sidebar-logout-btn"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.userSidebar.logout}</span>
            </button>
          </div>
        </aside>

        {/* Sidebar Backdrop on Mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TAB 1: USER DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome banner */}
              <div className="p-6 rounded-3xl bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                    Welcome back to Shiv Computer Portal
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Namaste, {currentUser.name}
                  </h1>
                  <p className="text-xs text-blue-100 max-w-lg">
                    Manage your government certificates, agricultural subsidies, land records, and download official affidavit formats.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('apply')}
                    className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Apply for Service</span>
                  </button>
                </div>
              </div>

              {/* Status Summary KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">My Applications</div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalUserApps}</div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">Submitted</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">In Progress</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {pendingUserApps + processingUserApps}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Under department check</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Approved</div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {approvedUserApps}
                  </div>
                  <div className="text-[11px] text-emerald-500 mt-0.5">Ready for collection</div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Payments Made</div>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                    ₹{userPayments.reduce((acc, p) => acc + p.amount, 0)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{userPayments.length} transactions</div>
                </div>
              </div>

              {/* Quick Tracker Search */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    Instant Application Status Tracker
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your Application Tracking ID (e.g. <strong>APP-2026-001</strong>) to view current stage and department remarks.
                </p>

                <form onSubmit={handleTrackSubmit} className="flex gap-2 max-w-lg">
                  <input
                    type="text"
                    placeholder="Enter Application ID..."
                    value={trackSearchId}
                    onChange={(e) => setTrackSearchId(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>Track</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>

                {trackedApp && (
                  <div className="mt-3 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
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
                        Status: <strong className="text-blue-700 dark:text-blue-300">{trackedApp.status}</strong> • Submitted: {trackedApp.applicationDate}
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
                                {app.status}
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
            </div>
          )}

          {/* TAB 2: APPLY FOR SERVICE (CATALOG + APPLICATION TRIGGER) */}
          {activeTab === 'apply' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Apply for Citizen & e-Governance Services
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Select a government certificate or assistance service below to submit an online application with Shiv Computer.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.filter((s) => s.enabled).map((service) => (
                  <div
                    key={service.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-blue-600 font-semibold mb-1">
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
                        <div>Processing: <strong>{service.processingTime}</strong></div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Required: {service.requiredDocuments.join(', ')}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setServiceToApply(service)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <span>Apply Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
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
                          {app.status}
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
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-1">
                        <span className="uppercase">{form.category}</span>
                        <span>{form.fileSize}</span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {form.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {form.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        incrementFormDownload(form.id);
                        alert(`Downloading official PDF form: ${form.title}`);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF Form</span>
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
                  {userApplications.map((app) => (
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
                  ))}
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
                {userApplications.map((app) => (
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
                        {app.status}
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
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}>
                        <Check className="w-4 h-4 mx-auto mb-1" />
                        <div>4. Outcome</div>
                        <div className="text-[10px] text-slate-400">{app.status}</div>
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
                ))}
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
                                {p.status}
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
                {notifications
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
                  ))}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Shiv Computer Center Contacts
                  </h3>

                  <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{websiteContent.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>support@shivcomputer.com</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{websiteContent.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Hours: {websiteContent.workingHours}</span>
                    </div>
                  </div>
                </div>

                {/* Submit query */}
                <form
                  onSubmit={handleSendInquiry}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs"
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
                      placeholder="e.g. Help needed with iKhedut Tar Fencing survey number"
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
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser.email}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed outline-none"
                    />
                  </div>
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
