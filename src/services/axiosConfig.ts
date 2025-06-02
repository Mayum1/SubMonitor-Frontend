import axios from 'axios';
import { authService } from './authService';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosInstance.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        const token = authService.getToken();
        if (token) {
            console.log('Adding Authorization header with token');
            const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
            config.headers.Authorization = `Bearer ${cleanToken}`;
        } else {
            console.log('No token available for request');
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Received response:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('Response error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message
        });
        if (error.response?.status === 401) {
            console.log('Unauthorized response, logging out...');
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 