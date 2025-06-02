import axios from 'axios';
import { ApiResponse, User } from '../types';
import axiosInstance from './axiosConfig';

const API_URL = 'http://localhost:8080/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: number;
  email: string;
  role: string;
  token: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<{ token: string; user: { id: number; email: string; role: string } }> {
    console.log('Starting login process with credentials:', { email: credentials.email });
    try {
      console.log('Making login request to backend...');
      const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
      console.log('Received response from backend:', response.data);
      
      const data = response.data;
      if (data.token) {
        console.log('Token received, processing...');
        // Map backend response to expected frontend structure
        return {
          token: data.token.startsWith('Bearer ') ? data.token.substring(7) : data.token,
          user: {
            id: data.id,
            email: data.email,
            role: data.role
          }
        };
      }
      console.log('No token in response');
      return data;
    } catch (error) {
      console.error('Login error details:', error);
      throw error;
    }
  },
  
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await axios.post<ApiResponse<AuthResponse>>(`${API_URL}/auth/register`, userData);
    return response.data;
  },
  
  logout() {
    console.log('Logging out, clearing localStorage');
    localStorage.removeItem('user');
  },
  
  getCurrentUser(): Promise<{ data: LoginResponse }> {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return Promise.resolve({
        data: {
          token: user.token,
          id: user.id,
            email: user.email,
            role: user.role
        }
      });
    }
    return Promise.reject(new Error('No user found'));
  },
  
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await axios.put<ApiResponse<User>>(`${API_URL}/auth/profile`, userData);
    return response.data;
  },
  
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<null>> {
    const response = await axios.put<ApiResponse<null>>(`${API_URL}/auth/password`, data);
    return response.data;
  },

  getToken() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const token = user?.token;
      console.log('Getting token:', token ? 'Token exists' : 'No token');
      return token;
    }
    console.log('No user found in localStorage');
    return null;
  }
};