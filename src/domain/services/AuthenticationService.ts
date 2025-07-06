import { Result } from '../../shared/types/Result';
import { BusinessError, ValidationError } from '../../shared/types/errors';
import { AuthApiService, AuthResponse, UserInfo, LoginRequest, RegisterRequest, ChangePasswordRequest } from '../../infrastructure/api/AuthApiService';
import { TokenService, DecodedToken } from '../../infrastructure/services/TokenService';
import { AuthValidationService } from './AuthValidationService';

export interface AuthUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export interface AuthenticationResult {
  user: AuthUser;
  isAuthenticated: boolean;
}

export class AuthenticationService {
  constructor(
    private authApiService: AuthApiService,
    private validationService: AuthValidationService
  ) {}

  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials): Promise<Result<AuthenticationResult, BusinessError>> {
    try {
      // Validate input
      const validation = this.validationService.validateLoginCredentials(credentials);
      if (!validation.isValid) {
        return Result.failure(
          new ValidationError(validation.errors.join(', '), 'credentials', credentials)
        );
      }

      // Prepare API request
      const loginRequest: LoginRequest = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      };

      // Call API
      const result = await this.authApiService.login(loginRequest);

      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Login failed', 'LOGIN_ERROR', result.error.message)
        );
      }

      const authResponse = result.value;
      const authUser = this.mapUserInfoToAuthUser(authResponse.user);

      return Result.success({
        user: authUser,
        isAuthenticated: true
      });

    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error during login', 'UNKNOWN_ERROR', error)
      );
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<Result<AuthenticationResult, BusinessError>> {
    try {
      // Validate input
      const validation = this.validationService.validateRegistrationData(userData);
      if (!validation.isValid) {
        return Result.failure(
          new ValidationError(validation.errors.join(', '), 'userData', userData)
        );
      }

      // Prepare API request
      const registerRequest: RegisterRequest = {
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        role: userData.role
      };

      // Call API
      const result = await this.authApiService.register(registerRequest);

      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Registration failed', 'REGISTRATION_ERROR', result.error.message)
        );
      }

      const authResponse = result.value;
      const authUser = this.mapUserInfoToAuthUser(authResponse.user);

      return Result.success({
        user: authUser,
        isAuthenticated: true
      });

    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error during registration', 'UNKNOWN_ERROR', error)
      );
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<Result<void, BusinessError>> {
    try {
      await this.authApiService.logout();
      return Result.success(undefined);
    } catch (error) {
      // Even if API call fails, we consider logout successful locally
      return Result.success(undefined);
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshAuthentication(): Promise<Result<AuthenticationResult, BusinessError>> {
    try {
      const result = await this.authApiService.refreshToken();

      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Token refresh failed', 'REFRESH_ERROR', result.error.message)
        );
      }

      const authResponse = result.value;
      const authUser = this.mapUserInfoToAuthUser(authResponse.user);

      return Result.success({
        user: authUser,
        isAuthenticated: true
      });

    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error during token refresh', 'UNKNOWN_ERROR', error)
      );
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<Result<AuthUser | null, BusinessError>> {
    try {
      if (!this.isAuthenticated()) {
        return Result.success(null);
      }

      const result = await this.authApiService.getCurrentUser();

      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to get current user', 'USER_FETCH_ERROR', result.error.message)
        );
      }

      const authUser = this.mapUserInfoToAuthUser(result.value);
      return Result.success(authUser);

    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while getting current user', 'UNKNOWN_ERROR', error)
      );
    }
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<Result<void, BusinessError>> {
    try {
      // Validate input
      const validation = this.validationService.validatePasswordChange(passwordData);
      if (!validation.isValid) {
        return Result.failure(
          new ValidationError(validation.errors.join(', '), 'passwordData', passwordData)
        );
      }

      const result = await this.authApiService.changePassword(passwordData);

      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Password change failed', 'PASSWORD_CHANGE_ERROR', result.error.message)
        );
      }

      return Result.success(undefined);

    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error during password change', 'UNKNOWN_ERROR', error)
      );
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<Result<void, BusinessError>> {
    try {
      // Validate email
      const validation = this.validationService.validateEmail(email);
      if (!validation.isValid) {
        return Result.failure(
          new ValidationError(validation.errors.join(', '), 'email', email)
        );
      }

      const result = await this.authApiService.requestPasswordReset(email.trim().toLowerCase());

      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Password reset request failed', 'PASSWORD_RESET_REQUEST_ERROR', result.error.message)
        );
      }

      return Result.success(undefined);

    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error during password reset request', 'UNKNOWN_ERROR', error)
      );
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return TokenService.isAuthenticated();
  }

  /**
   * Get current user from stored token (synchronous)
   */
  getCurrentUserFromToken(): AuthUser | null {
    const decodedToken = TokenService.getCurrentUser();
    if (!decodedToken) {
      return null;
    }

    return {
      userId: decodedToken.userId,
      email: decodedToken.email,
      firstName: decodedToken.name.split(' ')[0] || '',
      lastName: decodedToken.name.split(' ').slice(1).join(' ') || '',
      fullName: decodedToken.name,
      role: decodedToken.role,
      isActive: true,
      createdAt: new Date(decodedToken.iat * 1000).toISOString()
    };
  }

  /**
   * Check if token needs refresh
   */
  needsTokenRefresh(): boolean {
    return TokenService.isTokenExpired();
  }

  /**
   * Clear authentication state
   */
  clearAuthentication(): void {
    TokenService.clearTokens();
  }

  /**
   * Map API UserInfo to domain AuthUser
   */
  private mapUserInfoToAuthUser(userInfo: UserInfo): AuthUser {
    return {
      userId: userInfo.userId,
      email: userInfo.email,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      fullName: userInfo.fullName,
      role: userInfo.role,
      isActive: userInfo.isActive,
      createdAt: userInfo.createdAt
    };
  }
}