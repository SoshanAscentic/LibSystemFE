import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

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
      withCredentials: true, // CHANGED: Enable httpOnly cookies
      timeout: 30000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // SECURE Request interceptor - No manual token handling needed
    this.client.interceptors.request.use(
      (config) => {
        // REMOVED: Manual Authorization header setup
        // httpOnly cookies are sent automatically by the browser
        
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
        return Promise.reject(error);
      }
    );

    // SECURE Response interceptor for error handling and token refresh
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
            // CHANGED: Use secure refresh endpoint
            console.log('ApiClient: Attempting secure token refresh');
            const refreshResult = await this.refreshTokenSecure();
            
            if (refreshResult.success) {
              console.log('ApiClient: Secure token refresh successful');
              this.processQueue(null);
              
              // Retry the original request (cookies are updated automatically)
              return this.client(originalRequest);
            } else {
              console.log('ApiClient: Secure token refresh failed');
              this.processQueue(refreshResult.error);
              this.redirectToLogin();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            console.error('ApiClient: Secure refresh error:', refreshError);
            this.processQueue(refreshError);
            this.redirectToLogin();
            return Promise.reject(error);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other error status codes
        if (error.response?.status === 403) {
          console.error('ApiClient: Access forbidden - insufficient permissions');
        } else if (error.response?.status === 404) {
          console.error('ApiClient: Resource not found');
        } else if (error.response?.status && error.response.status >= 500) {
          console.error('ApiClient: Server error occurred');
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * SECURE: Refresh tokens using httpOnly cookies
   */
  private async refreshTokenSecure(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('ApiClient: Starting secure token refresh');
      
      // Use a separate axios instance to avoid interceptor loops
      const refreshClient = axios.create({
        baseURL: this.client.defaults.baseURL,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Include httpOnly cookies
      });

      const response = await refreshClient.post('/api/auth/secure/refresh');

      if (response.data.success) {
        console.log('ApiClient: Secure token refresh successful');
        // Tokens are automatically updated in httpOnly cookies by the server
        return { success: true };
      } else {
        console.log('ApiClient: Secure token refresh failed - invalid response');
        return { success: false, error: new Error('Token refresh failed') };
      }
    } catch (error) {
      console.error('ApiClient: Secure token refresh request failed:', error);
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
    console.log('ApiClient: Redirecting to login due to authentication failure');
    
    // Redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // HTTP Methods (unchanged)
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

  // Upload file (unchanged)
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

  // Download file (unchanged)
  async download(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<Blob>> {
    return this.client.get(url, {
      ...config,
      responseType: 'blob',
    });
  }

  // SECURE Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Set custom header (unchanged)
  setHeader(key: string, value: string): void {
    this.client.defaults.headers.common[key] = value;
  }

  // Remove custom header (unchanged)
  removeHeader(key: string): void {
    delete this.client.defaults.headers.common[key];
  }

  // Get current configuration
  getConfig() {
    return this.client.defaults;
  }

  // SECURE: Check authentication status
  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await this.client.get('/api/auth/secure/verify');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}