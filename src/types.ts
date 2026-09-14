export type LoginRole = 'admin' | 'user';

export type CurrentView = 'login' | 'admin-dashboard' | 'user-dashboard';

export type LanguageCode = 'en' | 'gu' | 'hi';

export type ThemeMode = 'light' | 'dark';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export type ApplicationStatus =
  | 'Pending'
  | 'Processing'
  | 'Document Required'
  | 'Approved'
  | 'Rejected'
  | 'Completed';

export type PaymentStatus = 'Paid' | 'Pending' | 'Waived' | 'Failed';

export interface UploadedDocument {
  id: string;
  name: string;
  status: 'Verified' | 'Uploaded' | 'Needs Correction';
  size: string;
  date: string;
}

export interface Application {
  id: string;
  serviceId: string;
  serviceName: string;
  category: 'general' | 'agriculture';
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantAddress: string;
  applicationDate: string;
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  fee: number;
  requiredDocuments: string[];
  uploadedDocuments: UploadedDocument[];
  adminNotes?: string;
  lastUpdated: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: 'general' | 'agriculture';
  description: string;
  fee: number;
  processingTime: string;
  requiredDocuments: string[];
  enabled: boolean;
  department: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  category: 'general' | 'agriculture' | 'revenue' | 'panchayat';
  description: string;
  fileSize: string;
  fileType: string;
  downloadCount: number;
  enabled: boolean;
  lastUpdated: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  joinedDate: string;
  totalApplications: number;
  totalPaid: number;
}

export interface PaymentRecord {
  id: string;
  applicationId: string;
  applicantId: string;
  applicantName: string;
  serviceName: string;
  amount: number;
  date: string;
  method: 'UPI' | 'Net Banking' | 'Cash' | 'Debit Card';
  status: 'Successful' | 'Pending' | 'Failed';
  transactionRef: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  targetRole: 'all' | 'admin' | 'user';
  userId?: string;
  type: 'info' | 'alert' | 'success' | 'warning';
}

export interface WebsiteContent {
  homeHeading: string;
  homeSubheading: string;
  notices: string[];
  announcements: { id: string; title: string; date: string; active: boolean }[];
  workingHours: string;
  contactEmail: string;
  contactPhone: string;
  ownerName: string;
  whatsappNumber: string;
  address: string;
  aboutUs: string;
}

export interface TranslationStrings {
  brandName: string;
  brandTagline: string;
  adminRole: string;
  userRole: string;
  adminBadge: string;
  userBadge: string;
  adminHeading: string;
  userHeading: string;
  adminSubtitle: string;
  userSubtitle: string;
  adminUsernameLabel: string;
  adminUsernamePlaceholder: string;
  userIdentifierLabel: string;
  userIdentifierPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  showPassword: string;
  hidePassword: string;
  rememberMe: string;
  forgotPassword: string;
  loginButton: string;
  loggingIn: string;
  backToHome: string;
  demoCredentialsNote: string;
  errors: {
    usernameRequired: string;
    emailOrUsernameRequired: string;
    passwordRequired: string;
    passwordTooShort: string;
  };
  simulations: {
    loginSuccessTitle: string;
    loginSuccessMsg: string;
    forgotPasswordTitle: string;
    forgotPasswordMsg: string;
    forgotPasswordInstruction: string;
    close: string;
    homeNavTitle: string;
    homeNavMsg: string;
  };
  securityNote: string;
  footerRights: string;
  adminSidebar: {
    dashboard: string;
    applications: string;
    services: string;
    agricultureServices: string;
    forms: string;
    customers: string;
    documents: string;
    payments: string;
    notifications: string;
    reports: string;
    websiteContent: string;
    userManagement: string;
    adminSettings: string;
    logout: string;
  };
  userSidebar: {
    dashboard: string;
    myApplications: string;
    applyForService: string;
    agricultureServices: string;
    forms: string;
    myDocuments: string;
    payments: string;
    notifications: string;
    myProfile: string;
    helpSupport: string;
    logout: string;
  };
}
