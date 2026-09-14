import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Application,
  ApplicationStatus,
  CustomerUser,
  CurrentView,
  FormTemplate,
  LanguageCode,
  LoginRole,
  NotificationItem,
  PaymentRecord,
  ServiceItem,
  ThemeMode,
  TranslationStrings,
  WebsiteContent,
} from '../types';
import {
  CURRENT_USER,
  INITIAL_APPLICATIONS,
  INITIAL_FORMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_SERVICES,
  INITIAL_AGRICULTURE_SERVICES,
  INITIAL_USERS,
  INITIAL_WEBSITE_CONTENT,
} from '../data/mockData';
import { TRANSLATIONS } from '../translations';

interface AppContextType {
  currentView: CurrentView;
  setCurrentView: (view: CurrentView) => void;
  selectedRole: LoginRole;
  setSelectedRole: (role: LoginRole) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  t: TranslationStrings;

  // Data
  currentUser: CustomerUser;
  users: CustomerUser[];
  services: ServiceItem[];
  agricultureServices: ServiceItem[];
  forms: FormTemplate[];
  applications: Application[];
  payments: PaymentRecord[];
  notifications: NotificationItem[];
  websiteContent: WebsiteContent;

  // Actions
  loginAs: (role: LoginRole) => void;
  logout: () => void;

  // Service Management (Admin)
  addService: (newService: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, updates: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;
  toggleServiceEnabled: (id: string) => void;

  // Forms Management (Admin)
  addForm: (newForm: Omit<FormTemplate, 'id' | 'downloadCount' | 'lastUpdated'>) => void;
  updateForm: (id: string, updates: Partial<FormTemplate>) => void;
  deleteForm: (id: string) => void;
  toggleFormEnabled: (id: string) => void;
  incrementFormDownload: (id: string) => void;

  // Application Management (Admin & User)
  updateApplicationStatus: (id: string, status: ApplicationStatus, adminNote?: string) => void;
  applyForService: (service: ServiceItem, applicantNotes?: string) => Application;
  uploadUserDoc: (appId: string, docName: string) => void;

  // Customer Management (Admin)
  toggleUserStatus: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<CustomerUser>) => void;

  // Notifications
  createNotification: (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => void;
  deleteNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;

  // Website Content (Admin)
  updateWebsiteContent: (updates: Partial<WebsiteContent>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Role State
  const [selectedRole, setSelectedRole] = useState<LoginRole>('admin');
  const [currentView, setCurrentView] = useState<CurrentView>(() => {
    // Check URL or hash if provided
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    if (hash.includes('admin') || path.includes('admin-dashboard')) return 'admin-dashboard';
    if (hash.includes('user') || path.includes('user-dashboard')) return 'user-dashboard';
    return 'login';
  });

  const [language, setLanguage] = useState<LanguageCode>('en');
  const [theme, setTheme] = useState<ThemeMode>('light');

  // Core Data
  const [currentUser, setCurrentUser] = useState<CustomerUser>(CURRENT_USER);
  const [users, setUsers] = useState<CustomerUser[]>(() => {
    const saved = localStorage.getItem('sc_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('sc_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [agricultureServices, setAgricultureServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('sc_agri_services');
    return saved ? JSON.parse(saved) : INITIAL_AGRICULTURE_SERVICES;
  });

  const [forms, setForms] = useState<FormTemplate[]>(() => {
    const saved = localStorage.getItem('sc_forms');
    return saved ? JSON.parse(saved) : INITIAL_FORMS;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('sc_applications');
    return saved ? JSON.parse(saved) : INITIAL_APPLICATIONS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('sc_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('sc_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [websiteContent, setWebsiteContent] = useState<WebsiteContent>(() => {
    const saved = localStorage.getItem('sc_web_content');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_WEBSITE_CONTENT,
          ...parsed,
          ownerName: parsed.ownerName || INITIAL_WEBSITE_CONTENT.ownerName,
          whatsappNumber: parsed.whatsappNumber || INITIAL_WEBSITE_CONTENT.whatsappNumber,
          address: parsed.address && !parsed.address.includes('Junagadh') ? parsed.address : INITIAL_WEBSITE_CONTENT.address,
        };
      } catch {
        return INITIAL_WEBSITE_CONTENT;
      }
    }
    return INITIAL_WEBSITE_CONTENT;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('sc_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('sc_agri_services', JSON.stringify(agricultureServices));
  }, [agricultureServices]);

  useEffect(() => {
    localStorage.setItem('sc_forms', JSON.stringify(forms));
  }, [forms]);

  useEffect(() => {
    localStorage.setItem('sc_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('sc_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('sc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('sc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sc_web_content', JSON.stringify(websiteContent));
  }, [websiteContent]);

  // Sync hash with currentView for easy browser back/forward and bookmarking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('admin-dashboard')) {
        setCurrentView('admin-dashboard');
        setSelectedRole('admin');
      } else if (hash.includes('user-dashboard')) {
        setCurrentView('user-dashboard');
        setSelectedRole('user');
      } else if (hash.includes('login')) {
        setCurrentView('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (currentView === 'admin-dashboard') {
      if (window.location.hash !== '#/admin-dashboard') {
        window.location.hash = '#/admin-dashboard';
      }
    } else if (currentView === 'user-dashboard') {
      if (window.location.hash !== '#/user-dashboard') {
        window.location.hash = '#/user-dashboard';
      }
    } else {
      if (window.location.hash !== '#/login') {
        window.location.hash = '#/login';
      }
    }
  }, [currentView]);

  // Apply dark class to documentElement
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const loginAs = (role: LoginRole) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('user-dashboard');
    }
  };

  const logout = () => {
    setCurrentView('login');
  };

  // Service Management
  const addService = (newService: Omit<ServiceItem, 'id'>) => {
    const id = `${newService.category === 'agriculture' ? 'AGR' : 'SRV'}-${Date.now().toString().slice(-4)}`;
    const fullService: ServiceItem = { ...newService, id };
    if (newService.category === 'agriculture') {
      setAgricultureServices((prev) => [fullService, ...prev]);
    } else {
      setServices((prev) => [fullService, ...prev]);
    }
  };

  const updateService = (id: string, updates: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    setAgricultureServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setAgricultureServices((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleServiceEnabled = (id: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
    setAgricultureServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Forms Management
  const addForm = (newForm: Omit<FormTemplate, 'id' | 'downloadCount' | 'lastUpdated'>) => {
    const id = `FRM-${Date.now().toString().slice(-4)}`;
    const item: FormTemplate = {
      ...newForm,
      id,
      downloadCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setForms((prev) => [item, ...prev]);
  };

  const updateForm = (id: string, updates: Partial<FormTemplate>) => {
    setForms((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : f))
    );
  };

  const deleteForm = (id: string) => {
    setForms((prev) => prev.filter((f) => f.id !== id));
  };

  const toggleFormEnabled = (id: string) => {
    setForms((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const incrementFormDownload = (id: string) => {
    setForms((prev) =>
      prev.map((f) => (f.id === id ? { ...f, downloadCount: f.downloadCount + 1 } : f))
    );
  };

  // Application Updates
  const updateApplicationStatus = (
    id: string,
    status: ApplicationStatus,
    adminNote?: string
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const updated: Application = {
            ...app,
            status,
            adminNotes: adminNote !== undefined ? adminNote : app.adminNotes,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
          return updated;
        }
        return app;
      })
    );

    // Also auto-generate notification for the user
    const targetApp = applications.find((a) => a.id === id);
    if (targetApp) {
      createNotification({
        title: `Application ${id} Status Update`,
        message: `Your application for "${targetApp.serviceName}" is now marked as ${status}.${
          adminNote ? ` Admin note: "${adminNote}"` : ''
        }`,
        targetRole: 'user',
        userId: targetApp.applicantId,
        type:
          status === 'Approved' || status === 'Completed'
            ? 'success'
            : status === 'Rejected'
            ? 'alert'
            : status === 'Document Required'
            ? 'warning'
            : 'info',
      });
    }
  };

  // User applies for service
  const applyForService = (service: ServiceItem, applicantNotes?: string) => {
    const newId = `APP-SC-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: Application = {
      id: newId,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      applicantEmail: currentUser.email,
      applicantPhone: currentUser.phone,
      applicantAddress: currentUser.address,
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      paymentStatus: 'Paid',
      fee: service.fee,
      requiredDocuments: service.requiredDocuments,
      uploadedDocuments: [
        {
          id: `doc-${Date.now()}-1`,
          name: 'Aadhaar_Verification_Identity.pdf',
          status: 'Uploaded',
          size: '1.4 MB',
          date: new Date().toISOString().split('T')[0],
        },
        {
          id: `doc-${Date.now()}-2`,
          name: `${service.category === 'agriculture' ? 'Land_Record_Extract_7_12.pdf' : 'Applicant_Declaration.pdf'}`,
          status: 'Uploaded',
          size: '2.1 MB',
          date: new Date().toISOString().split('T')[0],
        },
      ],
      adminNotes: applicantNotes ? `Applicant remarks: ${applicantNotes}` : 'New application submitted via Citizen Portal.',
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setApplications((prev) => [newApp, ...prev]);

    // Add payment record
    const newPayment: PaymentRecord = {
      id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      applicationId: newId,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      serviceName: service.name,
      amount: service.fee,
      date: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      method: 'UPI',
      status: 'Successful',
      transactionRef: `UPI/${Date.now().toString().slice(-8)}/SHIVPAY`,
    };
    setPayments((prev) => [newPayment, ...prev]);

    // Send notifications
    createNotification({
      title: 'New Application Submitted',
      message: `Your application #${newId} for ${service.name} has been placed into the processing queue.`,
      targetRole: 'user',
      userId: currentUser.id,
      type: 'info',
    });

    createNotification({
      title: 'New Citizen Application Received',
      message: `${currentUser.name} applied for ${service.name} (Fee ₹${service.fee} paid).`,
      targetRole: 'admin',
      type: 'info',
    });

    return newApp;
  };

  const uploadUserDoc = (appId: string, docName: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const newDoc = {
            id: `doc-${Date.now()}`,
            name: docName,
            status: 'Uploaded' as const,
            size: '1.8 MB',
            date: new Date().toISOString().split('T')[0],
          };
          return {
            ...app,
            uploadedDocuments: [...app.uploadedDocuments, newDoc],
            status: app.status === 'Document Required' ? 'Processing' : app.status,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return app;
      })
    );
  };

  // User Management
  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u
      )
    );
  };

  const updateUser = (userId: string, updates: Partial<CustomerUser>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  // Notifications
  const createNotification = (notif: Omit<NotificationItem, 'id' | 'date' | 'read'>) => {
    const item: NotificationItem = {
      ...notif,
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Website Content
  const updateWebsiteContent = (updates: Partial<WebsiteContent>) => {
    setWebsiteContent((prev) => ({ ...prev, ...updates }));
  };

  const t = TRANSLATIONS[language];

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedRole,
        setSelectedRole,
        language,
        setLanguage,
        theme,
        toggleTheme,
        t,
        currentUser,
        users,
        services,
        agricultureServices,
        forms,
        applications,
        payments,
        notifications,
        websiteContent,
        loginAs,
        logout,
        addService,
        updateService,
        deleteService,
        toggleServiceEnabled,
        addForm,
        updateForm,
        deleteForm,
        toggleFormEnabled,
        incrementFormDownload,
        updateApplicationStatus,
        applyForService,
        uploadUserDoc,
        toggleUserStatus,
        updateUser,
        createNotification,
        deleteNotification,
        markNotificationAsRead,
        updateWebsiteContent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
