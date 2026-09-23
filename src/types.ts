export type LoginRole = 'admin' | 'user';

export type CurrentView =
  | 'login'
  | 'register'
  | 'admin-login'
  | 'admin-dashboard'
  | 'user-dashboard';

export type LanguageCode = 'en' | 'gu';

export type ThemeMode = 'light' | 'dark';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
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
  uid?: string;
  name: string;
  username?: string;
  email: string;
  mobile?: string;
  phone: string;
  address: string;
  role?: 'admin' | 'user';
  status: 'Active' | 'Inactive';
  joinedDate: string;
  createdAt?: any;
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
  authCredentialsNote: string;
  signUpTab: string;
  signInTab: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  mobileLabel: string;
  mobilePlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  registerButton: string;
  registering: string;
  dontHaveAccount: string;
  alreadyHaveAccount: string;
  signUpLink: string;
  signInLink: string;
  errors: {
    usernameRequired: string;
    emailOrUsernameRequired: string;
    passwordRequired: string;
    passwordTooShort: string;
    nameRequired: string;
    usernameInvalid: string;
    emailInvalid: string;
    mobileRequired: string;
    mobileInvalid: string;
    confirmPasswordRequired: string;
    passwordsDoNotMatch: string;
    usernameTaken: string;
    emailAlreadyRegistered: string;
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
  forgotPasswordModal: {
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    sendButton: string;
    sending: string;
    successTitle: string;
    successMsg: string;
    checkInboxNote: string;
    directLinkTitle: string;
    directLinkDesc: string;
    copyLink: string;
    linkCopied: string;
    openLink: string;
    instantResetTab: string;
    emailLinkTab: string;
    instantResetTitle: string;
    instantResetSubtitle: string;
    newPasswordLabel: string;
    confirmPasswordLabel: string;
    updatePasswordBtn: string;
    updating: string;
    instantSuccessTitle: string;
    instantSuccessMsg: string;
    backToLogin: string;
    resendLink: string;
    cancel: string;
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
  common: {
    save: string;
    cancel: string;
    edit: string;
    delete: string;
    submit: string;
    view: string;
    upload: string;
    download: string;
    search: string;
    filter: string;
    close: string;
    refresh: string;
    back: string;
    next: string;
    status: string;
    actions: string;
    details: string;
    date: string;
    category: string;
    all: string;
    loading: string;
    noData: string;
    success: string;
    error: string;
    confirm: string;
    logout: string;
    login: string;
    copy: string;
    copied: string;
    yes: string;
    no: string;
    clear: string;
    viewAll: string;
    total: string;
    active: string;
    pending: string;
    approved: string;
    rejected: string;
    processing: string;
    completed: string;
    documentRequired: string;
    paid: string;
    waived: string;
    failed: string;
    verified: string;
    home: string;
    dashboard: string;
    profile: string;
    documents: string;
    notifications: string;
    settings: string;
    contact: string;
    support: string;
    users: string;
    reports: string;
    searchPlaceholder: string;
    noRecordsFound: string;
    confirmDelete: string;
    deleteWarning: string;
    searchApplications: string;
    overview: string;
    quickActions: string;
    recentApplications: string;
    statusTitle: string;
  };
  status: {
    pending: string;
    processing: string;
    documentRequired: string;
    approved: string;
    rejected: string;
    completed: string;
  };
  addressCard: {
    owner: string;
    whatsapp: string;
    address: string;
    phone: string;
    centerOwnerTitle: string;
    centerOwnerSub: string;
    verifiedCenter: string;
    officeAddressTitle: string;
    copyAddress: string;
    addressCopied: string;
    whatsappButton: string;
    callButton: string;
    viewOnMap: string;
    workingHours: string;
    workingHoursVal: string;
    quickContact: string;
    facilityTitle: string;
    facilitySub: string;
  };
  aiChatbot: {
    launcherText: string;
    title: string;
    subtitle: string;
    welcomeMsg: string;
    inputPlaceholder: string;
    sendButton: string;
    closeButton: string;
    quickQuestionsTitle: string;
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    disclaimer: string;
  };
}

export interface FormSubmission {
  id?: string;
  submissionId: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  formType: string;
  formData: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'approved' | 'rejected' | ApplicationStatus;
  createdAt: any;
  updatedAt: any;
  adminNotes?: string;
}

export interface AdminRecord {
  uid: string;
  email: string;
  role: 'admin';
  createdAt: any;
}
