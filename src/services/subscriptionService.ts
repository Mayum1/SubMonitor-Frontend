import api from './api';

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

interface SubscriptionFormData {
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

export interface SubscriptionWithReminderRequest {
  title: string;
  serviceId?: number;
  price: number;
  currency: string;
  firstPaymentDate: string;
  billingPeriodValue: number;
  billingPeriodUnit: string;
  autoRenew: boolean;
  logoOverrideUrl?: string;
  subscriptionCategory: string;
  reminder?: {
    daysBefore: number;
    timeOfDay: string;
    isEnabled: boolean;
  };
}

export const subscriptionService = {
  async getAll(): Promise<Subscription[]> {
    const response = await api.get<Subscription[]>('/subscriptions');
    return response.data;
  },
  
  async getById(id: number): Promise<Subscription> {
    const response = await api.get<Subscription>(`/subscriptions/${id}`);
    return response.data;
  },
  
  async getActiveByUserId(userId: number): Promise<Subscription[]> {
    const response = await api.get<Subscription[]>(`/subscriptions/active/user/${userId}`);
    return response.data;
  },
  
  async getArchivedByUserId(userId: number): Promise<Subscription[]> {
    const response = await api.get<Subscription[]>(`/subscriptions/archived/user/${userId}`);
    return response.data;
  },
  
  async create(data: SubscriptionFormData): Promise<Subscription> {
    const response = await api.post<Subscription>('/subscriptions', data);
    return response.data;
  },
  
  async update(id: number, data: Partial<SubscriptionFormData>): Promise<Subscription> {
    const response = await api.put<Subscription>(`/subscriptions/${id}`, data);
    return response.data;
  },
  
  async delete(id: number): Promise<null> {
    const response = await api.delete<null>(`/subscriptions/${id}`);
    return response.data;
  },
  
  async archive(id: number): Promise<Subscription> {
    const response = await api.put<Subscription>(`/subscriptions/archive/${id}`);
    return response.data;
  },
  
  async restore(id: number): Promise<Subscription> {
    const response = await api.put<Subscription>(`/subscriptions/restore/${id}`);
    return response.data;
  },
  
  async getAllServiceProviders(): Promise<ServiceProvider[]> {
    const response = await api.get<ServiceProvider[]>('/service-providers');
    return response.data;
  },

  async createWithReminder(data: SubscriptionWithReminderRequest, userId: number) {
    const response = await api.post(`/subscriptions?userId=${userId}`, data);
    return response.data;
  }
};