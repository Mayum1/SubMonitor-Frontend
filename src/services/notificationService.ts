import api from './api';
import { ApiResponse, Notification } from '../types';

export const notificationService = {
  async getAll(): Promise<ApiResponse<Notification[]>> {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications');
    return response.data;
  },
  
  async markAsRead(id: string): Promise<ApiResponse<Notification>> {
    const response = await api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return response.data;
  },
  
  async markAllAsRead(): Promise<ApiResponse<null>> {
    const response = await api.put<ApiResponse<null>>('/notifications/read-all');
    return response.data;
  },
  
  async delete(id: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/notifications/${id}`);
    return response.data;
  },
  
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return response.data;
  },
  
  async subscribeToNotifications(subscription: PushSubscription): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/notifications/subscribe', { subscription });
    return response.data;
  },
};