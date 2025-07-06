import { ApiClient, ApiResponse } from './ApiClient';
import { Result } from '../../shared/types/Result';
import { TokenData, TokenService } from '../services/TokenService';

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  user: UserInfo;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface UserInfo {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class AuthApiService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<Result<AuthResponse, Error>> {
    try {
      const response = await this.apiClient.post<AuthResponse>('/api/auth/login', credentials);
      
      if (response.data.success) {
        const authData = response.data.data;
        
        // Store tokens
        const tokenData: TokenData = {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          expiresAt: Date.now() + (authData.expiresIn * 1000),
          tokenType: authData.tokenType
        };
        
        TokenService.storeTokens(tokenData);
        
        return Result.success(authData);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Login failed'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.response?.data?.error?.message || error.message || 'Network error during login'));
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterRequest): Promise<Result<AuthResponse, Error>> {
    try {
      const response = await this.apiClient.post<AuthResponse>('/api/auth/register', userData);
      
      if (response.data.success) {
        const authData = response.data.data;
        
        // Store tokens
        const tokenData: TokenData = {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          expiresAt: Date.now() + (authData.expiresIn * 1000),
          tokenType: authData.tokenType
        };
        
        TokenService.storeTokens(tokenData);
        
        return Result.success(authData);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Registration failed'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.response?.data?.error?.message || error.message || 'Network error during registration'));
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<Result<AuthResponse, Error>> {
    try {
      const refreshToken = TokenService.getRefreshToken();
      
      if (!refreshToken) {
        return Result.failure(new Error('No refresh token available'));
      }

      const response = await this.apiClient.post<AuthResponse>('/api/auth/refresh', {
        refreshToken
      });
      
      if (response.data.success) {
        const authData = response.data.data;
        
        // Store new tokens
        const tokenData: TokenData = {
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          expiresAt: Date.now() + (authData.expiresIn * 1000),
          tokenType: authData.tokenType
        };
        
        TokenService.storeTokens(tokenData);
        
        return Result.success(authData);
      } else {
        TokenService.clearTokens(); // Clear invalid tokens
        return Result.failure(new Error(response.data.error?.message || 'Token refresh failed'));
      }
    } catch (error: any) {
      TokenService.clearTokens(); // Clear invalid tokens
      return Result.failure(new Error(error.response?.data?.error?.message || error.message || 'Network error during token refresh'));
    }
  }

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<Result<UserInfo, Error>> {
    try {
      const response = await this.apiClient.get<UserInfo>('/api/auth/me');
      
      if (response.data.success) {
        return Result.success(response.data.data);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to get user info'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.response?.data?.error?.message || error.message || 'Network error while getting user info'));
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<Result<void, Error>> {
    try {
      const refreshToken = TokenService.getRefreshToken();
      
      if (refreshToken) {
        // Notify server about logout
        await this.apiClient.post('/api/auth/logout', { refreshToken });
      }
      
      // Clear local tokens regardless of server response
      TokenService.clearTokens();
      
      return Result.success(undefined);
    } catch (error: any) {
      // Clear tokens even if server request fails
      TokenService.clearTokens();
      return Result.success(undefined); // Logout should always succeed locally
    }
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<Result<void, Error>> {
    try {
      const response = await this.apiClient.post<void>('/api/auth/change-password', passwordData);
      
      if (response.data.success) {
        return Result.success(undefined);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Password change failed'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.response?.data?.error?.message || error.message || 'Network error during password change'));
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<Result<void, Error>> {
    try {
      const response = await this.apiClient.post<void>('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        return Result.success(undefined);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Password reset request failed'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.response?.data?.error?.message || error.message || 'Network error during password reset request'));
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<Result<void, Error>> {
    try {
      const response = await this.apiClient.post<void>('/api/auth/reset-password', {
        token,
        newPassword,
        confirmPassword
      });
      
      if (response.data.success) {
        return Result.success(undefined);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Password reset failed'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.response?.data?.error?.message || error.message || 'Network error during password reset'));
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<Result<void, Error>> {
    try {
      const response = await this.apiClient.post<void>('/api/auth/verify-email', { token });
      
      if (response.data.success) {
        return Result.success(undefined);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Email verification failed'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.response?.data?.error?.message || error.message || 'Network error during email verification'));
    }
  }
}