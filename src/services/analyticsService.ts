import api from './api';
import { ApiResponse, MonthlySpending, CategoryBreakdown } from '../types';

interface AnalyticsSummary {
  monthlySpending: MonthlySpending[];
  categoryBreakdown: CategoryBreakdown[];
  totalMonthly: number;
  totalAnnual: number;
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
};