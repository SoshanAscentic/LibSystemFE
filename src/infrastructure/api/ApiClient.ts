import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { TokenService } from '../services/TokenService';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    type: string;
    validationErrors?: Record<string, string[]>;
  };
  timestamp: string;
  traceId: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    type: string;
    validationErrors?: Record<string, string[]>;
  };
  timestamp: string;
  traceId: string;
}

export class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];

  constructor(baseURL?: string) {
    this.client = axios.create({
      baseURL: baseURL || import.meta.env.VITE_API_BASE_URL || 'https://localhost:7033',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // FIXED: Request interceptor with proper token handling
    this.client.interceptors.request.use(
      (config) => {
        console.log('🔍 ApiClient: Making request to:', config.method?.toUpperCase(), config.url);
        
        // Get token from TokenService
        const token = TokenService.getAccessToken();
        console.log('🔍 ApiClient: Token available:', !!token, 'Length:', token?.length || 0);
        
        if (token) {
          // Add Authorization header
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ ApiClient: Added Authorization header');
        } else {
          console.warn('⚠️ ApiClient: No token available for request');
          // Don't add authorization header if no token
        }
        
        // Add request ID for tracing
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        // Add CSRF token if available (for POST/PUT/DELETE requests)
        if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
          const csrfToken = this.getCSRFToken();
          if (csrfToken) {
            config.headers['X-CSRF-TOKEN'] = csrfToken;
          }
        }
        
        return config;
      },
      (error) => {
        console.error('❌ ApiClient: Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // FIXED: Response interceptor with better error handling
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ ApiClient: Request successful:', response.config.method?.toUpperCase(), response.config.url, response.status);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        console.error('❌ ApiClient: Request failed:', {
          method: originalRequest.method?.toUpperCase(),
          url: originalRequest.url,
          status: error.response?.status,
          statusText: error.response?.statusText
        });

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          console.log('🔍 ApiClient: Handling 401 unauthorized error');
          
          // Check if we have a token
          const currentToken = TokenService.getAccessToken();
          if (!currentToken) {
            console.log('❌ ApiClient: No token available, redirecting to login');
            this.redirectToLogin();
            return Promise.reject(error);
          }

          // Check if token is expired
          if (TokenService.isTokenExpired()) {
            console.log('❌ ApiClient: Token is expired, clearing auth and redirecting to login');
            TokenService.clearTokens();
            this.redirectToLogin();
            return Promise.reject(error);
          }

          // If we have a valid token but still getting 401, there might be a server issue
          console.warn('⚠️ ApiClient: Have valid token but got 401, possible server auth issue');
          
          // Try to refresh if we're not already refreshing
          if (this.isRefreshing) {
            console.log('🔄 ApiClient: Already refreshing, queueing request');
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            console.log('🔄 ApiClient: Attempting token refresh');
            
            // For now, since we don't have refresh token functionality,
            // we'll just verify the current token with the server
            const verifyResult = await this.verifyTokenWithServer();
            
            if (verifyResult.success) {
              console.log('✅ ApiClient: Token verification successful');
              this.processQueue(null);
              
              // Retry the original request
              return this.client(originalRequest);
            } else {
              console.log('❌ ApiClient: Token verification failed');
              this.processQueue(verifyResult.error);
              TokenService.clearTokens();
              this.redirectToLogin();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error('❌ ApiClient: Token verification error:', refreshError);
            this.processQueue(refreshError);
            TokenService.clearTokens();
            this.redirectToLogin();
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other error status codes
        if (error.response?.status === 403) {
          console.error('❌ ApiClient: Access forbidden - insufficient permissions');
        } else if (error.response?.status === 404) {
          console.error('❌ ApiClient: Resource not found');
        } else if (error.response?.status && error.response.status >= 500) {
          console.error('❌ ApiClient: Server error occurred');
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Verify token with server (since we don't have refresh tokens yet)
   */
  private async verifyTokenWithServer(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🔍 ApiClient: Verifying token with server');
      
      const token = TokenService.getAccessToken();
      if (!token) {
        return { success: false, error: new Error('No token available') };
      }

      // Use a separate axios instance to avoid interceptor loops
      const verifyClient = axios.create({
        baseURL: this.client.defaults.baseURL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000,
      });

      // Try to verify with auth/me endpoint
      const response = await verifyClient.get('/api/auth/me');

      if (response.data.success) {
        console.log('✅ ApiClient: Token verification successful');
        return { success: true };
      } else {
        console.log('❌ ApiClient: Token verification failed - invalid response');
        return { success: false, error: new Error('Token verification failed') };
      }
    } catch (error) {
      console.error('❌ ApiClient: Token verification request failed:', error);
      return { success: false, error };
    }
  }

  /**
   * Get CSRF token from cookie (if using CSRF protection)
   */
  private getCSRFToken(): string | null {
    try {
      const name = 'CSRF-TOKEN=';
      const decodedCookie = decodeURIComponent(document.cookie);
      const ca = decodedCookie.split(';');
      
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return null;
    } catch (error) {
      console.warn('⚠️ ApiClient: Failed to get CSRF token:', error);
      return null;
    }
  }

  private processQueue(error: any): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(null);
      }
    });
    
    this.failedQueue = [];
  }

  private redirectToLogin(): void {
    console.log('🔄 ApiClient: Redirecting to login due to authentication failure');
    
    // Redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.get(url, config);
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.post(url, data, config);
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.put(url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.patch(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.client.delete(url, config);
  }

  // Upload file
  async upload<T>(url: string, file: File, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.client.post(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Download file
  async download(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> {
    return this.client.get(url, {
      ...config,
      responseType: 'blob',
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Set custom header
  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  // Remove custom header
  removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }

  // Get current configuration
  getConfig() {
    return this.client.defaults;
  }

  // Check authentication status
  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/auth/me');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Manual token refresh method (for future use)
  async refreshToken(): Promise<boolean> {
    try {
      // This would be implemented when refresh tokens are available
      console.log('🔄 ApiClient: Manual token refresh not implemented yet');
      return false;
    } catch (error) {
      console.error('❌ ApiClient: Manual token refresh failed:', error);
      return false;
    }
  }
}