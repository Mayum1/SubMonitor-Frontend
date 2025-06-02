import api from './api';

export interface HistoryLog {
  id: number;
  actionType: string;
  description: string;
  amountCharged: number | null;
  currency: string | null;
  timestamp: string;
  subscription?: {
    id: number;
    title: string;
  } | null;
  subscriptionTitle?: string;
}

export async function getHistoryLogsByUserId(userId: number): Promise<HistoryLog[]> {
  const response = await api.get(`/history-logs/by-user/${userId}`);
  return response.data;
} 