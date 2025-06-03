import api from './api';
import { ApiResponse, MonthlySpending, CategoryBreakdown } from '../types';

interface AnalyticsSummary {
  monthlySpending: MonthlySpending[];
  categoryBreakdown: CategoryBreakdown[];
  totalMonthly: number;
  totalAnnual: number;
}

export interface BarChartItem {
  name: string;
  value: number;
  formatted: string;
}

export const analyticsService = {
  async getSummary(userId: number): Promise<ApiResponse<AnalyticsSummary>> {
    const response = await api.get<ApiResponse<AnalyticsSummary>>(`/analytics/summary/user/${userId}`);
    return response.data;
  },
  
  async getMonthlySpending(userId: number): Promise<MonthlySpending[]> {
    const response = await api.get<MonthlySpending[]>(`/analytics/monthly-spending/user/${userId}`);
    return response.data;
  },
  
  async getCategoryBreakdown(userId: number): Promise<CategoryBreakdown[]> {
    const response = await api.get<CategoryBreakdown[]>(`/analytics/category-breakdown/user/${userId}`);
    return response.data;
  },
  
  async exportData(userId: number, format: 'csv' | 'json' | 'pdf'): Promise<Blob> {
    const response = await api.get(`/analytics/export/user/${userId}?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getMostExpensive(userId: number): Promise<BarChartItem[]> {
    const response = await api.get<BarChartItem[]>(`/analytics/most-expensive/user/${userId}`);
    return response.data;
  },

  async getLongest(userId: number): Promise<BarChartItem[]> {
    const response = await api.get<BarChartItem[]>(`/analytics/longest/user/${userId}`);
    return response.data;
  },

  async getMostFundsSpent(userId: number): Promise<BarChartItem[]> {
    const response = await api.get<BarChartItem[]>(`/analytics/most-funds-spent/user/${userId}`);
    return response.data;
  },

  async getYearlySpending(userId: number): Promise<number> {
    const response = await api.get<number>(`/analytics/yearly-spending/user/${userId}`);
    return response.data;
  },
};