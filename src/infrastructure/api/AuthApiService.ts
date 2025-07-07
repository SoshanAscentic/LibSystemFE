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

// Backend response interface (what your backend actually returns)
interface BackendAuthResponse {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  token: string;
  expiresAt: string;
  memberId?: number;
  [key: string]: any;
}

export class AuthApiService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Login user - Updated to handle your backend's response format
   */
  async login(credentials: LoginRequest): Promise<Result<AuthResponse, Error>> {
    try {
      console.log('🔐 AuthApiService: Making login request to /api/auth/login');
      console.log('🔐 AuthApiService: Request payload:', { 
        email: credentials.email, 
        password: '[HIDDEN]' 
      });
      
      const response = await this.apiClient.post('/api/auth/login', credentials);
      
      console.log('🔐 AuthApiService: ===== FULL LOGIN RESPONSE =====');
      console.log('🔐 AuthApiService: Response:', response.data);
      
      if (response.data.success) {
        const backendData: BackendAuthResponse = response.data.data as BackendAuthResponse;
        console.log('🔐 AuthApiService: Backend data:', backendData);
        
        // Map your backend's format to the expected AuthResponse format
        const authResponse: AuthResponse = this.mapBackendResponseToAuthResponse(backendData);
        
        console.log('🔐 AuthApiService: Mapped auth response:', authResponse);
        
        // Store tokens using the mapped data
        const tokenData: TokenData = {
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          expiresAt: Date.now() + (authResponse.expiresIn * 1000),
          tokenType: authResponse.tokenType
        };
        
        console.log('🔐 AuthApiService: Storing token data:', {
          accessTokenLength: tokenData.accessToken?.length,
          refreshTokenLength: tokenData.refreshToken?.length,
          tokenType: tokenData.tokenType,
          expiresAt: new Date(tokenData.expiresAt).toISOString()
        });
        
        TokenService.storeTokens(tokenData);
        
        // Verify storage worked
        console.log('🔐 AuthApiService: Token storage verification:', TokenService.getTokenInfo());
        
        return Result.success(authResponse);
      } else {
        console.error('🔐 AuthApiService: Login failed - API returned success: false');
        return Result.failure(new Error(response.data.error?.message || 'Login failed'));
      }
    } catch (error: any) {
      console.error('🔐 AuthApiService: Login error:', error);
      return this.handleApiError(error, 'login');
    }
  }

  /**
   * Register new user - Updated to handle your backend's response format
   */
  async register(userData: RegisterRequest): Promise<Result<AuthResponse, Error>> {
    try {
      console.log('🔐 AuthApiService: Making registration request to /api/auth/register');
      console.log('🔐 AuthApiService: Request payload:', { 
        ...userData, 
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });
      
      const response = await this.apiClient.post('/api/auth/register', userData);
      
      console.log('🔐 AuthApiService: ===== FULL REGISTRATION RESPONSE =====');
      console.log('🔐 AuthApiService: Response:', response.data);
      
      if (response.data.success) {
        const backendData: BackendAuthResponse = response.data.data as BackendAuthResponse;
        console.log('🔐 AuthApiService: Backend registration data:', backendData);
        
        // Map your backend's format to the expected AuthResponse format
        const authResponse: AuthResponse = this.mapBackendResponseToAuthResponse(backendData);
        
        console.log('🔐 AuthApiService: Mapped registration response:', authResponse);
        
        // Store tokens using the mapped data
        const tokenData: TokenData = {
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          expiresAt: Date.now() + (authResponse.expiresIn * 1000),
          tokenType: authResponse.tokenType
        };
        
        console.log('🔐 AuthApiService: Storing registration token data:', {
          accessTokenLength: tokenData.accessToken?.length,
          refreshTokenLength: tokenData.refreshToken?.length,
          tokenType: tokenData.tokenType,
          expiresAt: new Date(tokenData.expiresAt).toISOString()
        });
        
        TokenService.storeTokens(tokenData);
        
        // Verify storage worked
        console.log('🔐 AuthApiService: Registration token storage verification:', TokenService.getTokenInfo());
        
        return Result.success(authResponse);
      } else {
        console.error('🔐 AuthApiService: Registration failed - API returned success: false');
        return Result.failure(new Error(response.data.error?.message || 'Registration failed'));
      }
    } catch (error: any) {
      console.error('🔐 AuthApiService: Registration error:', error);
      return this.handleApiError(error, 'registration');
    }
  }

  /**
   * Map backend response to expected AuthResponse format
   */
  private mapBackendResponseToAuthResponse(backendData: BackendAuthResponse): AuthResponse {
    // Extract user info from the flat response
    const userInfo: UserInfo = {
      userId: backendData.userId,
      email: backendData.email,
      firstName: backendData.fullName?.split(' ')[0] || '',
      lastName: backendData.fullName?.split(' ').slice(1).join(' ') || '',
      fullName: backendData.fullName || backendData.email,
      role: backendData.role || 'Member',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Map to expected AuthResponse format
    const authResponse: AuthResponse = {
      user: userInfo,
      accessToken: backendData.token,  // Your backend calls it 'token'
      refreshToken: backendData.token, // Use same token if no separate refresh token
      tokenType: 'Bearer',             // Default since backend doesn't provide this
      expiresIn: this.calculateExpiresIn(backendData.expiresAt)
    };

    return authResponse;
  }

  /**
   * Helper method to calculate expiresIn from backend's expiresAt
   */
  private calculateExpiresIn(expiresAt: string | number): number {
    try {
      if (!expiresAt) {
        console.warn('🔐 AuthApiService: No expiration provided, defaulting to 1 hour');
        return 3600; // 1 hour in seconds
      }
      
      let expirationTimestamp: number;
      
      if (typeof expiresAt === 'string') {
        // If it's a date string, parse it
        expirationTimestamp = new Date(expiresAt).getTime();
        console.log('🔐 AuthApiService: Parsed expiration date:', new Date(expirationTimestamp).toISOString());
      } else {
        // If it's already a timestamp
        expirationTimestamp = expiresAt;
      }
      
      // Calculate seconds from now until expiration
      const now = Date.now();
      const secondsUntilExpiry = Math.floor((expirationTimestamp - now) / 1000);
      
      console.log('🔐 AuthApiService: Expiration calculation:', {
        expiresAt,
        expirationTimestamp,
        now,
        secondsUntilExpiry
      });
      
      // Ensure it's a positive number, default to 1 hour if negative or invalid
      if (secondsUntilExpiry > 0) {
        return secondsUntilExpiry;
      } else {
        console.warn('🔐 AuthApiService: Calculated negative expiration, using default 1 hour');
        return 3600;
      }
    } catch (error) {
      console.warn('🔐 AuthApiService: Failed to calculate expiration, using default 1 hour:', error);
      return 3600; // Default to 1 hour
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleApiError(error: any, operation: string): Result<AuthResponse, Error> {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error(`🔐 AuthApiService: ${operation} HTTP Status:`, status);
      console.error(`🔐 AuthApiService: ${operation} Error Response:`, errorData);
      
      switch (status) {
        case 401:
          const message = errorData?.detail || errorData?.error?.message || 'Invalid credentials';
          return Result.failure(new Error(message));
        case 400:
          const validationMessage = errorData?.detail || errorData?.error?.message || 'Invalid request format';
          return Result.failure(new Error(validationMessage));
        case 409:
          const conflictMessage = errorData?.detail || errorData?.error?.message || 'User already exists';
          return Result.failure(new Error(conflictMessage));
        case 500:
          return Result.failure(new Error('Server error - please try again later'));
        case 404:
          return Result.failure(new Error(`${operation} service unavailable`));
        default:
          return Result.failure(new Error(`Network error (${status})`));
      }
    } else if (error.request) {
      console.error(`🔐 AuthApiService: ${operation} network error - no response from server`);
      return Result.failure(new Error('Cannot connect to server - please check your connection'));
    } else {
      console.error(`🔐 AuthApiService: ${operation} unexpected error:`, error.message);
      return Result.failure(new Error(error.message || 'An unexpected error occurred'));
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

      const response = await this.apiClient.post('/api/auth/refresh', {
        refreshToken
      });
      
      if (response.data.success) {
        const backendData: BackendAuthResponse = response.data.data as BackendAuthResponse;
        const authResponse = this.mapBackendResponseToAuthResponse(backendData);
        
        // Store new tokens
        const tokenData: TokenData = {
          accessToken: authResponse.accessToken,
          refreshToken: authResponse.refreshToken,
          expiresAt: Date.now() + (authResponse.expiresIn * 1000),
          tokenType: authResponse.tokenType
        };
        
        TokenService.storeTokens(tokenData);
        
        return Result.success(authResponse);
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
      const response = await this.apiClient.get('/api/auth/me');
      
      if (response.data.success) {
        const backendData: BackendAuthResponse = response.data.data as BackendAuthResponse;
        
        // Map backend user data to UserInfo format
        const userInfo: UserInfo = {
          userId: backendData.userId,
          email: backendData.email,
          firstName: backendData.fullName?.split(' ')[0] || '',
          lastName: backendData.fullName?.split(' ').slice(1).join(' ') || '',
          fullName: backendData.fullName || backendData.email,
          role: backendData.role || 'Member',
          isActive: backendData.isActive !== false,
          createdAt: backendData.createdAt || new Date().toISOString()
        };
        
        return Result.success(userInfo);
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
      const response = await this.apiClient.post('/api/auth/change-password', passwordData);
      
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
      const response = await this.apiClient.post('/api/auth/forgot-password', { email });
      
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
      const response = await this.apiClient.post('/api/auth/reset-password', {
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
      const response = await this.apiClient.post('/api/auth/verify-email', { token });
      
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