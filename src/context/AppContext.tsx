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
import {
  loginUser,
  registerUser,
  logoutUser,
  subscribeToAuth,
  subscribeToUsers,
  updateUserStatus as updateFirestoreUserStatus,
  updateUserProfile as updateFirestoreUserProfile,
  LoginParams,
  RegisterParams,
} from '../lib/firebase';

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

  // Real Firebase Auth & Session
  isAuthenticated: boolean;
  authLoading: boolean;
  authRole: 'admin' | 'user' | null;
  loginWithCredentials: (params: LoginParams) => Promise<CustomerUser>;
  registerNewUser: (params: RegisterParams) => Promise<CustomerUser>;

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
  logout: () => Promise<void>;

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

  // Customer Management (Admin & User Profile)
  toggleUserStatus: (userId: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<CustomerUser>) => Promise<void>;
  updateUserProfile: (updates: Partial<CustomerUser>) => Promise<void>;

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
  const [selectedRole, setSelectedRole] = useState<LoginRole>('user');
  const [currentView, setCurrentView] = useState<CurrentView>('login');

  // Firebase Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authRole, setAuthRole] = useState<'admin' | 'user' | null>(null);

  const [language, setLanguage] = useState<LanguageCode>('en');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem('sc_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    } catch {
      // ignore
    }
    return 'light';
  });

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

  // 1. Subscribe to Firebase Auth State changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((fbUser, role) => {
      if (fbUser) {
        setCurrentUser(fbUser);
        setAuthRole(role);
        setIsAuthenticated(true);
        setSelectedRole(role || 'user');

        // Route appropriately based on role
        const hash = window.location.hash.toLowerCase();
        if (role === 'admin') {
          if (hash.includes('user-dashboard')) {
            setCurrentView('user-dashboard');
          } else {
            setCurrentView('admin-dashboard');
          }
        } else {
          // Normal user: strictly restricted to user dashboard
          setCurrentView('user-dashboard');
        }
      } else {
        setIsAuthenticated(false);
        setAuthRole(null);
        setCurrentUser(CURRENT_USER);
        setCurrentView('login');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to real-time Users list from Firestore for Admin Directory
  useEffect(() => {
    // Only subscribe to user directory if authenticated as an administrator
    if (!isAuthenticated || authRole !== 'admin') {
      return;
    }

    const unsubscribe = subscribeToUsers((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setUsers(firestoreUsers);
        try {
          localStorage.setItem('sc_users', JSON.stringify(firestoreUsers));
        } catch {
          // ignore
        }
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, authRole]);

  // 3. Route Protection & Hash Synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();

      // If not authenticated, cannot open dashboards
      if (!authLoading && !isAuthenticated) {
        if (hash.includes('dashboard')) {
          setCurrentView('login');
          window.location.hash = '#/login';
        }
        return;
      }

      if (hash.includes('admin-dashboard')) {
        // Enforce RBAC: Non-admin users cannot access Admin Dashboard
        if (authRole !== 'admin') {
          alert('Access Denied: You do not have Administrator permissions.');
          setCurrentView('user-dashboard');
          window.location.hash = '#/user-dashboard';
        } else {
          setCurrentView('admin-dashboard');
          setSelectedRole('admin');
        }
      } else if (hash.includes('user-dashboard')) {
        setCurrentView('user-dashboard');
        setSelectedRole('user');
      } else if (hash.includes('login')) {
        setCurrentView('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [authLoading, isAuthenticated, authRole]);

  // Keep hash aligned with currentView
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

  // Sync auxiliary state to localStorage
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
    localStorage.setItem('sc_web_content', JSON.stringify(websiteContent));
  }, [websiteContent]);

  // Apply dark mode classes to documentElement & body
  useEffect(() => {
    try {
      localStorage.setItem('sc_theme', theme);
    } catch {
      // ignore
    }
    if (theme === 'dark') {
      document.documentElement.classList.add('dark', 'dark-mode');
      document.body.classList.add('dark', 'dark-mode');
    } else {
      document.documentElement.classList.remove('dark', 'dark-mode');
      document.body.classList.remove('dark', 'dark-mode');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Real Firebase Login
  const loginWithCredentials = async (params: LoginParams): Promise<CustomerUser> => {
    const { user, role } = await loginUser(params);
    setCurrentUser(user);
    setAuthRole(role);
    setIsAuthenticated(true);
    setSelectedRole(role);

    if (role === 'admin') {
      setCurrentView('admin-dashboard');
      window.location.hash = '#/admin-dashboard';
    } else {
      setCurrentView('user-dashboard');
      window.location.hash = '#/user-dashboard';
    }

    return user;
  };

  // Real Firebase Registration
  const registerNewUser = async (params: RegisterParams): Promise<CustomerUser> => {
    const newUser = await registerUser(params);
    setCurrentUser(newUser);
    setUsers((prev) => {
      if (prev.some((u) => u.id === newUser.id || (newUser.username && u.username === newUser.username))) {
        return prev;
      }
      return [newUser, ...prev];
    });
    setAuthRole('user');
    setIsAuthenticated(true);
    setSelectedRole('user');
    setCurrentView('user-dashboard');
    window.location.hash = '#/user-dashboard';
    return newUser;
  };

  // Legacy quick login selector
  const loginAs = (role: LoginRole) => {
    setSelectedRole(role);
    if (isAuthenticated) {
      if (role === 'admin' && authRole === 'admin') {
        setCurrentView('admin-dashboard');
      } else {
        setCurrentView('user-dashboard');
      }
    }
  };

  // Real Firebase Sign Out
  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsAuthenticated(false);
    setAuthRole(null);
    setCurrentUser(CURRENT_USER);
    setCurrentView('login');
    window.location.hash = '#/login';
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
    const fullForm: FormTemplate = {
      ...newForm,
      id,
      downloadCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setForms((prev) => [fullForm, ...prev]);
  };

  const updateForm = (id: string, updates: Partial<FormTemplate>) => {
    setForms((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              ...updates,
              lastUpdated: new Date().toISOString().split('T')[0],
            }
          : f
      )
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
      prev.map((f) =>
        f.id === id ? { ...f, downloadCount: f.downloadCount + 1 } : f
      )
    );
  };

  // Application Management
  const updateApplicationStatus = (
    id: string,
    status: ApplicationStatus,
    adminNote?: string
  ) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const updated = {
            ...app,
            status,
            adminNote: adminNote || app.adminNote,
            lastUpdated: new Date().toISOString().split('T')[0],
          };

          createNotification({
            title: `Application Status Updated: ${status}`,
            message: `Your application #${app.id} (${app.serviceName}) has been marked as ${status}.${
              adminNote ? ` Note: "${adminNote}"` : ''
            }`,
            targetRole: 'user',
            userId: app.applicantId,
            type: status === 'Approved' ? 'success' : status === 'Rejected' ? 'alert' : 'info',
          });

          return updated;
        }
        return app;
      })
    );
  };

  const applyForService = (service: ServiceItem, applicantNotes?: string): Application => {
    const newId = `APP-${Date.now().toString().slice(-5)}`;
    const newApp: Application = {
      id: newId,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      applicantEmail: currentUser.email,
      applicantPhone: currentUser.phone || '+91 98790 00000',
      applicantAddress: currentUser.address || 'Keshod, Gujarat',
      applicationDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      paymentStatus: 'Paid',
      fee: service.fee,
      requiredDocuments: service.requiredDocuments,
      uploadedDocuments: service.requiredDocuments.map((docName, idx) => ({
        id: `doc-${Date.now()}-${idx}`,
        name: docName,
        status: 'Uploaded',
        size: '1.2 MB',
        date: new Date().toISOString().split('T')[0],
      })),
      adminNotes: applicantNotes,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setApplications((prev) => [newApp, ...prev]);

    const newPayment: PaymentRecord = {
      id: `TXN-${Date.now().toString().slice(-6)}`,
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

  // User Management with Firestore Sync
  const toggleUserStatus = async (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;
    const newStatus: 'Active' | 'Inactive' = targetUser.status === 'Active' ? 'Inactive' : 'Active';

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );

    try {
      await updateFirestoreUserStatus(userId, newStatus);
    } catch (err) {
      console.error('Failed to update user status in Firestore:', err);
    }
  };

  const updateUser = async (userId: string, updates: Partial<CustomerUser>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    if (currentUser.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }

    try {
      await updateFirestoreUserProfile(userId, updates);
    } catch (err) {
      console.error('Failed to update user profile in Firestore:', err);
    }
  };

  const updateUserProfile = async (updates: Partial<CustomerUser>) => {
    if (!currentUser.id) return;
    await updateUser(currentUser.id, updates);
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
        t: TRANSLATIONS[language],
        isAuthenticated,
        authLoading,
        authRole,
        loginWithCredentials,
        registerNewUser,
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
        updateUserProfile,
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
