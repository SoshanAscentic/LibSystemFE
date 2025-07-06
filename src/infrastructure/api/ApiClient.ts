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
      timeout: 30000, // 30 second timeout
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const authHeader = TokenService.getAuthorizationHeader();
        if (authHeader) {
          config.headers.Authorization = authHeader;
        }
        
        // Add request ID for tracing
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
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
            // Try to refresh the token
            const refreshResult = await this.refreshToken();
            
            if (refreshResult.success) {
              // Process the failed queue
              this.processQueue(null);
              
              // Retry the original request with new token
              const authHeader = TokenService.getAuthorizationHeader();
              if (authHeader) {
                originalRequest.headers!.Authorization = authHeader;
              }
              
              return this.client(originalRequest);
            } else {
              // Refresh failed, redirect to login
              this.processQueue(refreshResult.error);
              this.redirectToLogin();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.processQueue(refreshError);
            this.redirectToLogin();
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other error status codes
        if (error.response?.status === 403) {
          // Forbidden - insufficient permissions
          console.error('Access forbidden - insufficient permissions');
        } else if (error.response?.status === 404) {
          // Not found
          console.error('Resource not found');
        } else if (error.response?.status && error.response.status >= 500) {
          // Server errors
          console.error('Server error occurred');
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<{ success: boolean; error?: any }> {
    try {
      const refreshToken = TokenService.getRefreshToken();
      
      if (!refreshToken) {
        return { success: false, error: new Error('No refresh token available') };
      }

      // Use a separate axios instance to avoid interceptor loops
      const refreshClient = axios.create({
        baseURL: this.client.defaults.baseURL,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await refreshClient.post('/api/auth/refresh', {
        refreshToken
      });

      if (response.data.success) {
        const authData = response.data.data;
        
        // Store new tokens
        const tokenData = {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          expiresAt: Date.now() + (authData.expiresIn * 1000),
          tokenType: authData.tokenType
        };
        
        TokenService.storeTokens(tokenData);
        
        return { success: true };
      } else {
        TokenService.clearTokens();
        return { success: false, error: new Error('Token refresh failed') };
      }
    } catch (error) {
      TokenService.clearTokens();
      return { success: false, error };
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
    // Clear tokens
    TokenService.clearTokens();
    
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
}