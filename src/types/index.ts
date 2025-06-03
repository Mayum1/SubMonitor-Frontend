// Auth types
export interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string;
  preferredLanguage?: 'en' | 'ru';
  role: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Subscription types
export enum BillingPeriodUnit {
  DAY = 'DAY',
  MONTH = 'MONTH',
  YEAR = 'YEAR'
}

export enum SubscriptionCategory {
  NONE = 'NONE',
  EDUCATION = 'EDUCATION',
  VIDEO = 'VIDEO',
  STORAGE = 'STORAGE',
  COMMUNICATION = 'COMMUNICATION',
  MUSIC = 'MUSIC',
  BOOKS = 'BOOKS',
  INTERNET = 'INTERNET',
  GAMES = 'GAMES',
  SOCIAL_NETWORKS = 'SOCIAL_NETWORKS',
  ALL_IN_ONE = 'ALL_IN_ONE',
  APPLICATIONS = 'APPLICATIONS',
  FINANCE = 'FINANCE',
  TRANSPORT = 'TRANSPORT',
  OTHER = 'OTHER'
}

export interface ServiceProvider {
  id: number;
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  category: SubscriptionCategory;
}

export interface Subscription {
  id: number;
  user: {
    id: number;
    email: string;
  };
  service?: ServiceProvider;
  title: string;
  price: number;
  currency: string;
  firstPaymentDate: string;
  nextPaymentDate?: string;
  billingPeriodValue: number;
  billingPeriodUnit: BillingPeriodUnit;
  autoRenew: boolean;
  isArchived: boolean;
  logoOverrideUrl?: string;
  subscriptionCategory: SubscriptionCategory;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionFormData {
  title: string;
  serviceId?: number;
  price: number;
  currency: string;
  firstPaymentDate: string;
  billingPeriodValue: number;
  billingPeriodUnit: BillingPeriodUnit;
  autoRenew: boolean;
  logoOverrideUrl?: string;
  subscriptionCategory: SubscriptionCategory;
}

export interface SubscriptionState {
  subscriptions: Subscription[];
  filteredSubscriptions: Subscription[];
  categories: SubscriptionCategory[];
  activeFilter: SubscriptionCategory | null;
  sortBy: 'title' | 'price' | 'nextPaymentDate';
  sortDirection: 'asc' | 'desc';
  isLoading: boolean;
  error: string | null;
}

// Notification types
export interface Notification {
  id: string;
  type: 'renewal' | 'payment' | 'price_change' | 'system';
  title: string;
  message: string;
  read: boolean;
  date: string;
  subscriptionId?: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// Analytics types
export interface MonthlySpending {
  month: string;
  amount: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface Reminder {
  id?: number;
  subscription?: Subscription;
  daysBefore: number;
  timeOfDay: string; // 'HH:mm' format
  isEnabled: boolean;
}

export interface HistoryLog {
  id: number;
  // Add other fields as needed
}

export interface DashboardSummary {
  activeSubscriptionsCount: number;
  archivedSubscriptionsCount: number;
  totalMonthlySpending: number;
  upcomingReminders: Reminder[];
  latestHistoryLogs: HistoryLog[];
  subscriptionsByCategory: Record<string, number>;
}

export interface AnalyticsState {
  monthlySpending: MonthlySpending[];
  categoryBreakdown: CategoryBreakdown[];
  totalMonthly: number;
  totalAnnual: number;
  isLoading: boolean;
  error: string | null;
  summary?: DashboardSummary;
}

// Settings types
export interface UserSettings {
  notifyBeforeRenewal: boolean;
  renewalNotificationDays: number;
  notifyOnPriceChange: boolean;
  defaultCurrency: string;
  defaultTimezone: string;
  theme: 'light' | 'dark' | 'system';
  isTelegramLinked?: boolean;
}

export interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}