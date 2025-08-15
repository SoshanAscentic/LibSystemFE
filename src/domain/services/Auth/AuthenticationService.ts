import { Result } from '../../../shared/types/Result';
import { BusinessError, ValidationError } from '../../../shared/types/errors';
import { AuthValidationService } from './AuthValidationService';
import { TokenService } from '../../../infrastructure/services/TokenService';

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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class AuthenticationService {
  private baseURL: string;

  constructor(
    private validationService: AuthValidationService
  ) {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7033';
    console.log('🔗 AuthenticationService: Using API base URL:', this.baseURL);
  }

  /**
   * FIXED: Login with better role handling and token validation
   */
  async login(credentials: LoginCredentials): Promise<Result<AuthenticationResult, BusinessError>> {
    try {
      console.log('🔐 AuthenticationService: Starting login process for:', credentials.email);
      
      // Validate input
      const validation = this.validationService.validateLoginCredentials(credentials);
      if (!validation.isValid) {
        console.log('❌ AuthenticationService: Validation failed:', validation.errors);
        return Result.failure(
          new ValidationError(validation.errors.join(', '), 'credentials', credentials)
        );
      }

      const loginRequest = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
        rememberMe: credentials.rememberMe || false
      };

      console.log('🔐 AuthenticationService: Making login request...');
      
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest)
      });

      console.log('🔐 AuthenticationService: Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ AuthenticationService: Login successful');
        console.log('🔍 AuthenticationService: Raw server response:', data);

        if (data.success && data.data) {
          // CRITICAL: Validate the token before storing
          const token = data.data.token;
          if (!token) {
            console.error('❌ AuthenticationService: No token in server response!');
            return Result.failure(new BusinessError('Login failed - no authentication token received', 'LOGIN_ERROR'));
          }

          // Decode and validate the token immediately
          console.log('🔍 AuthenticationService: Validating received token...');
          const decodedToken = TokenService.decodeToken(token);
          if (!decodedToken) {
            console.error('❌ AuthenticationService: Received invalid token from server!');
            return Result.failure(new BusinessError('Login failed - invalid authentication token', 'LOGIN_ERROR'));
          }

          if (!decodedToken.role || decodedToken.role.trim() === '') {
            console.error('❌ AuthenticationService: Token has no valid role!');
            console.error('❌ AuthenticationService: Decoded token:', decodedToken);
            return Result.failure(new BusinessError('Login failed - no user role in authentication token', 'LOGIN_ERROR'));
          }

          console.log('✅ AuthenticationService: Token validation successful');
          console.log('✅ AuthenticationService: User role from token:', decodedToken.role);

          // Store the validated token
          const tokenData = {
            accessToken: token,
            refreshToken: data.data.refreshToken || token, // Use same token if no refresh token
            tokenType: 'Bearer',
            expiresAt: this.calculateExpiresAt(data.data.expiresAt || decodedToken.exp)
          };

          TokenService.storeTokens(tokenData);
          console.log('📝 AuthenticationService: Token stored successfully');

          // Create AuthUser from the DECODED TOKEN, not server response
          // This ensures consistency with token refresh scenarios
          const authUser = this.mapDecodedTokenToAuthUser(decodedToken, data.data);
          
          console.log('✅ AuthenticationService: Final AuthUser:', {
            userId: authUser.userId,
            email: authUser.email,
            role: authUser.role,
            fullName: authUser.fullName
          });

          return Result.success({
            user: authUser,
            isAuthenticated: true
          });
        }
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || 'Login failed';
      
      console.error('❌ AuthenticationService: Login failed:', errorMessage);
      return Result.failure(new BusinessError('Login failed', 'LOGIN_ERROR', errorMessage));

    } catch (error: any) {
      console.error('❌ AuthenticationService: Unexpected error during login:', error);
      return Result.failure(
        new BusinessError('Unexpected error during login', 'UNKNOWN_ERROR', error.message || error)
      );
    }
  }

  /**
   * FIXED: Register with better role handling
   */
  async register(userData: RegisterData): Promise<Result<AuthenticationResult, BusinessError>> {
    try {
      console.log('🔐 AuthenticationService: Starting registration for:', userData.email);
      
      const validation = this.validationService.validateRegistrationData(userData);
      if (!validation.isValid) {
        return Result.failure(
          new ValidationError(validation.errors.join(', '), 'userData', userData)
        );
      }

      const registerRequest = {
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        role: userData.role
      };

      const response = await fetch(`${this.baseURL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerRequest)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Same validation as login
          const token = data.data.token;
          if (!token) {
            return Result.failure(new BusinessError('Registration failed - no authentication token received', 'REGISTRATION_ERROR'));
          }

          const decodedToken = TokenService.decodeToken(token);
          if (!decodedToken || !decodedToken.role) {
            return Result.failure(new BusinessError('Registration failed - invalid authentication token', 'REGISTRATION_ERROR'));
          }

          // Store the validated token
          const tokenData = {
            accessToken: token,
            refreshToken: data.data.refreshToken || token,
            tokenType: 'Bearer',
            expiresAt: this.calculateExpiresAt(data.data.expiresAt || decodedToken.exp)
          };

          TokenService.storeTokens(tokenData);

          const authUser = this.mapDecodedTokenToAuthUser(decodedToken, data.data);
          
          return Result.success({
            user: authUser,
            isAuthenticated: true
          });
        }
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || 'Registration failed';
      return Result.failure(new BusinessError('Registration failed', 'REGISTRATION_ERROR', errorMessage));

    } catch (error: any) {
      return Result.failure(
        new BusinessError('Unexpected error during registration', 'UNKNOWN_ERROR', error.message || error)
      );
    }
  }

  /**
   * Standard Logout
   */
  async logout(): Promise<Result<void, BusinessError>> {
    try {
      console.log('🔐 AuthenticationService: Starting logout');
      
      // Try to call logout endpoint
      try {
        await fetch(`${this.baseURL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${TokenService.getAccessToken()}`,
            'Content-Type': 'application/json',
          }
        });
      } catch (error) {
        console.log('⚠️ AuthenticationService: Logout API failed, but continuing with local cleanup');
      }

      // Clear authentication data
      this.clearAuthentication();
      
      console.log('✅ AuthenticationService: Logout completed');
      return Result.success(undefined);
    } catch (error) {
      console.warn('⚠️ AuthenticationService: Logout API failed, but considering successful locally');
      this.clearAuthentication();
      return Result.success(undefined);
    }
  }

  /**
   * FIXED: Get Current User with better token handling
   */
  async getCurrentUser(): Promise<Result<AuthUser | null, BusinessError>> {
    try {
      console.log('🔐 AuthenticationService: Getting current user');
      
      // First, try to get user from stored token
      const tokenUser = this.getCurrentUserFromToken();
      if (tokenUser) {
        console.log('✅ AuthenticationService: Got user from token:', {
          userId: tokenUser.userId,
          email: tokenUser.email,
          role: tokenUser.role
        });
        return Result.success(tokenUser);
      }

      // If no valid token, try to get from server
      const token = TokenService.getAccessToken();
      if (!token) {
        console.log('🔐 AuthenticationService: No access token found');
        return Result.success(null);
      }

      try {
        const response = await fetch(`${this.baseURL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // If we get data from server, validate it has a role
            if (!data.data.role) {
              console.error('❌ AuthenticationService: Server user data has no role');
              this.clearAuthentication();
              return Result.success(null);
            }
            
            const authUser = this.mapServerResponseToAuthUser(data.data);
            return Result.success(authUser);
          }
        } else if (response.status === 401) {
          // Token expired or invalid
          console.log('🔐 AuthenticationService: Token expired, clearing authentication');
          this.clearAuthentication();
          return Result.success(null);
        }
      } catch (error) {
        console.log('⚠️ AuthenticationService: getCurrentUser API failed');
      }

      return Result.success(null);
    } catch (error) {
      console.error('❌ AuthenticationService: Error getting current user:', error);
      return Result.failure(new BusinessError('Unexpected error while getting current user', 'UNKNOWN_ERROR', error));
    }
  }

  /**
   * Check Authentication Status
   */
  isAuthenticated(): boolean {
    // Use the enhanced TokenService method
    return TokenService.isAuthenticated();
  }

  /**
   * Check if token needs refresh (simple version)
   */
  needsTokenRefresh(): boolean {
    return TokenService.needsTokenRefresh();
  }

  /**
   * Token refresh (placeholder)
   */
  async refreshAuthentication(): Promise<Result<AuthenticationResult, BusinessError>> {
    // For now, just return failure since we don't have refresh tokens implemented
    return Result.failure(new BusinessError('Token refresh not implemented', 'REFRESH_ERROR'));
  }

  /**
   * FIXED: Get current user from token with better validation
   */
  getCurrentUserFromToken(): AuthUser | null {
    try {
      const decodedToken = TokenService.getCurrentUser();
      if (!decodedToken) {
        console.log('AuthenticationService: No valid decoded token available');
        return null;
      }

      if (!decodedToken.role || decodedToken.role.trim() === '') {
        console.error('AuthenticationService: Token has no valid role, clearing authentication');
        this.clearAuthentication();
        return null;
      }

      console.log('✅ AuthenticationService: Creating AuthUser from token with role:', decodedToken.role);
      return this.mapDecodedTokenToAuthUser(decodedToken);
    } catch (error) {
      console.error('AuthenticationService: Error getting user from token:', error);
      this.clearAuthentication();
      return null;
    }
  }

  /**
   * Clear authentication data
   */
  clearAuthentication(): void {
    TokenService.clearTokens();
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<Result<void, BusinessError>> {
    try {
      const validation = this.validationService.validateEmail(email);
      if (!validation.isValid) {
        return Result.failure(
          new ValidationError(validation.errors.join(', '), 'email', email)
        );
      }

      const response = await fetch(`${this.baseURL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      if (response.ok) {
        return Result.success(undefined);
      }

      return Result.failure(new BusinessError('Password reset request failed', 'PASSWORD_RESET_REQUEST_ERROR'));
    } catch (error) {
      return Result.failure(new BusinessError('Unexpected error during password reset request', 'UNKNOWN_ERROR', error));
    }
  }

  /**
   * FIXED: Map decoded token to AuthUser (primary method)
   */
  private mapDecodedTokenToAuthUser(decodedToken: any, serverData?: any): AuthUser {
    console.log('🗂️ AuthenticationService: Mapping decoded token to AuthUser');
    console.log('🗂️ AuthenticationService: Token data:', {
      userId: decodedToken.userId,
      email: decodedToken.email,
      role: decodedToken.role,
      name: decodedToken.name
    });

    // Ensure we have a valid role
    if (!decodedToken.role || decodedToken.role.trim() === '') {
      throw new Error('Cannot create AuthUser - no valid role in token');
    }

    // Split the name into first and last name
    const fullName = decodedToken.name || decodedToken.fullName || '';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const authUser: AuthUser = {
      userId: decodedToken.userId || 0,
      email: decodedToken.email || '',
      firstName: firstName,
      lastName: lastName,
      fullName: fullName || decodedToken.email || 'Unknown User',
      role: decodedToken.role, // This is the critical field
      isActive: true, // Assume active if they have a valid token
      createdAt: serverData?.createdAt || new Date().toISOString()
    };

    console.log('✅ AuthenticationService: Created AuthUser with role:', authUser.role);
    return authUser;
  }

  /**
   * Map server response to AuthUser (fallback method)
   */
  private mapServerResponseToAuthUser(serverData: any): AuthUser {
    console.log('🗂️ AuthenticationService: Mapping server response to AuthUser');
    console.log('🗂️ AuthenticationService: Server data keys:', Object.keys(serverData));

    // Ensure server data has a role
    if (!serverData.role) {
      console.error('❌ Server response has no role field!');
      throw new Error('Cannot create AuthUser - no role in server response');
    }

    return {
      userId: serverData.userId || serverData.id || 0,
      email: serverData.email || '',
      firstName: serverData.firstName || serverData.fullName?.split(' ')[0] || '',
      lastName: serverData.lastName || serverData.fullName?.split(' ').slice(1).join(' ') || '',
      fullName: serverData.fullName || `${serverData.firstName || ''} ${serverData.lastName || ''}`.trim() || serverData.email || 'Unknown User',
      role: serverData.role, // Critical: Use server role directly
      isActive: serverData.isActive !== false,
      createdAt: serverData.createdAt || new Date().toISOString()
    };
  }

  /**
   * Helper method to calculate expiration timestamp
   */
  private calculateExpiresAt(expiresAt: string | number | undefined): number {
    try {
      if (!expiresAt) {
        console.warn('AuthenticationService: No expiration provided, defaulting to 1 hour');
        return Date.now() + (3600 * 1000); // 1 hour from now
      }
      
      let expirationTimestamp: number;
      
      if (typeof expiresAt === 'string') {
        expirationTimestamp = new Date(expiresAt).getTime();
      } else if (typeof expiresAt === 'number') {
        // If it's a Unix timestamp (seconds), convert to milliseconds
        expirationTimestamp = expiresAt > 1000000000000 ? expiresAt : expiresAt * 1000;
      } else {
        throw new Error('Invalid expiration format');
      }
      
      // Validate the calculated timestamp
      if (isNaN(expirationTimestamp) || expirationTimestamp <= Date.now()) {
        console.warn('AuthenticationService: Invalid expiration timestamp, using default');
        return Date.now() + (3600 * 1000);
      }
      
      return expirationTimestamp;
    } catch (error) {
      console.warn('AuthenticationService: Failed to calculate expiration:', error);
      return Date.now() + (3600 * 1000); // Default to 1 hour
    }
  }
}