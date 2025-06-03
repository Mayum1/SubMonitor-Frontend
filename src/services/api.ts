import axios, { AxiosError, AxiosInstance } from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = '/login';
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('Server error:', error);
    }
    
    return Promise.reject(error);
  }
);

export const updateUserSettings = (userId: number, settings: { defaultCurrency?: string; defaultTimezone?: string }) =>
  api.put(`/users/${userId}/settings`, settings);

export const fetchUserSettings = (userId: number) =>
  api.get(`/users/${userId}`);

export const unlinkTelegram = (userId: number) =>
  api.delete(`/telegram-links/${userId}`);

export default api;