import axios from 'axios';
import { TokenService } from '../../infrastructure/services/TokenService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7033';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// FIXED: Request interceptor to add auth token using TokenService
apiClient.interceptors.request.use(
  (config) => {
    console.log('🔍 Simple ApiClient: Making request to:', config.method?.toUpperCase(), config.url);
    
    // Get token from TokenService instead of localStorage directly
    const token = TokenService.getAccessToken();
    console.log('🔍 Simple ApiClient: Token available:', !!token, 'Length:', token?.length || 0);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Simple ApiClient: Added Authorization header');
    } else {
      console.warn('⚠️ Simple ApiClient: No token available for request');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Simple ApiClient: Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// FIXED: Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Simple ApiClient: Request successful:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Simple ApiClient: Request failed:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText
    });

    if (error.response?.status === 401) {
      console.warn('⚠️ Simple ApiClient: Got 401, checking token validity');
      
      // Check if token is expired or invalid
      if (TokenService.isTokenExpired() || !TokenService.getAccessToken()) {
        console.log('❌ Simple ApiClient: Token expired or missing, clearing auth');
        TokenService.clearTokens();
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          console.log('🔄 Simple ApiClient: Redirecting to login');
          window.location.href = '/login';
        }
      } else {
        console.warn('⚠️ Simple ApiClient: Have valid token but got 401 - possible server issue');
      }
    }
    
    return Promise.reject(error);
  }
);