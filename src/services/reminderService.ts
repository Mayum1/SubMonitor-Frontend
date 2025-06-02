import api from './api';

export interface CreateReminderDto {
  daysBefore: number;
  timeOfDay: string; // 'HH:mm'
  isEnabled: boolean;
  subscriptionId: number;
}

export const reminderService = {
  async create(data: CreateReminderDto) {
    const response = await api.post('/reminders', data);
    return response.data;
  },
}; 