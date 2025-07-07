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
   * Login user with credentials - Updated for backend response handling
   */
  async login(credentials: LoginCredentials): Promise<Result<AuthenticationResult, BusinessError>> {
    try {
      console.log('👤 AuthenticationService: Starting login process for:', credentials.email);
      
      // Validate input
      const validation = this.validationService.validateLoginCredentials(credentials);
      if (!validation.isValid) {
        console.log('👤 AuthenticationService: Validation failed:', validation.errors);
        return Result.failure(
          new ValidationError(validation.errors.join(', '), 'credentials', credentials)
        );
      }
      console.log('👤 AuthenticationService: Credentials validation passed');

      // Prepare API request
      const loginRequest: LoginRequest = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      };
      console.log('👤 AuthenticationService: Prepared API request for:', loginRequest.email);

      // Call API
      console.log('👤 AuthenticationService: Calling authApiService.login...');
      const result = await this.authApiService.login(loginRequest);
      console.log('👤 AuthenticationService: API call completed, result success:', result.isSuccess);

      if (result.isFailure) {
        console.error('👤 AuthenticationService: API call failed:', result.error.message);
        return Result.failure(
          new BusinessError('Login failed', 'LOGIN_ERROR', result.error.message)
        );
      }

      console.log('👤 AuthenticationService: API call successful, processing response...');
      const authResponse = result.value;
      console.log('👤 AuthenticationService: Auth response user:', authResponse.user);
      
      try {
        let authUser: AuthUser;
        
        // Now we should have proper user info from the mapped response
        if (authResponse.user) {
          console.log('👤 AuthenticationService: User info found in response, mapping...');
          authUser = this.mapUserInfoToAuthUser(authResponse.user);
          console.log('👤 AuthenticationService: User mapping successful:', authUser.email);
        } else {
          console.log('👤 AuthenticationService: No user info in response, trying to extract from token...');
          
          // Fallback: try to get user info from the stored token
          const tokenUser = this.getCurrentUserFromToken();
          
          if (tokenUser) {
            console.log('👤 AuthenticationService: Successfully extracted user from token:', tokenUser.email);
            authUser = tokenUser;
          } else {
            console.log('👤 AuthenticationService: Could not extract user from token, creating minimal user object...');
            
            // Final fallback: create minimal user object
            authUser = {
              userId: 0,
              email: credentials.email.toLowerCase(),
              firstName: '',
              lastName: '',
              fullName: credentials.email.split('@')[0],
              role: 'Member',
              isActive: true,
              createdAt: new Date().toISOString()
            };
            
            console.warn('👤 AuthenticationService: Using minimal user object - user info incomplete');
          }
        }
        
        const authResult = {
          user: authUser,
          isAuthenticated: true
        };
        
        console.log('👤 AuthenticationService: Login process completed successfully');
        console.log('👤 AuthenticationService: Final user object:', {
          userId: authUser.userId,
          email: authUser.email,
          fullName: authUser.fullName,
          role: authUser.role
        });
        
        return Result.success(authResult);
        
      } catch (mappingError) {
        console.error('👤 AuthenticationService: User processing failed:', mappingError);
        
        // Even if user mapping fails, if we have valid tokens, we can still proceed
        // with a minimal user object
        const minimalUser: AuthUser = {
          userId: 0,
          email: credentials.email.toLowerCase(),
          firstName: '',
          lastName: '',
          fullName: credentials.email.split('@')[0],
          role: 'Member',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        console.warn('👤 AuthenticationService: Using fallback minimal user due to mapping error');
        
        return Result.success({
          user: minimalUser,
          isAuthenticated: true
        });
      }

    } catch (error: any) {
      console.error('👤 AuthenticationService: Unexpected error during login:', error);
      console.error('👤 AuthenticationService: Error stack:', error.stack);
      return Result.failure(
        new BusinessError('Unexpected error during login', 'UNKNOWN_ERROR', error.message || error)
      );
    }
  }

  /**
   * Register new user - Updated for backend response handling
   */
  async register(userData: RegisterData): Promise<Result<AuthenticationResult, BusinessError>> {
    try {
      console.log('👤 AuthenticationService: Starting registration process for:', userData.email);
      
      // Validate input
      const validation = this.validationService.validateRegistrationData(userData);
      if (!validation.isValid) {
        console.log('👤 AuthenticationService: Registration validation failed:', validation.errors);
        return Result.failure(
          new ValidationError(validation.errors.join(', '), 'userData', userData)
        );
      }
      console.log('👤 AuthenticationService: Registration validation passed');

      // Prepare API request
      const registerRequest: RegisterRequest = {
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        role: userData.role
      };
      console.log('👤 AuthenticationService: Prepared registration request for:', registerRequest.email);

      // Call API
      console.log('👤 AuthenticationService: Calling authApiService.register...');
      const result = await this.authApiService.register(registerRequest);
      console.log('👤 AuthenticationService: Registration API call completed, result success:', result.isSuccess);

      if (result.isFailure) {
        console.error('👤 AuthenticationService: Registration API call failed:', result.error.message);
        return Result.failure(
          new BusinessError('Registration failed', 'REGISTRATION_ERROR', result.error.message)
        );
      }

      console.log('👤 AuthenticationService: Registration API call successful, processing response...');
      const authResponse = result.value;
      console.log('👤 AuthenticationService: Registration response user:', authResponse.user);

      try {
        let authUser: AuthUser;
        
        // Process user info from registration response
        if (authResponse.user) {
          console.log('👤 AuthenticationService: User info found in registration response, mapping...');
          authUser = this.mapUserInfoToAuthUser(authResponse.user);
          console.log('👤 AuthenticationService: Registration user mapping successful:', authUser.email);
        } else {
          console.log('👤 AuthenticationService: No user info in registration response, trying to extract from token...');
          
          // Fallback: try to get user info from the stored token
          const tokenUser = this.getCurrentUserFromToken();
          
          if (tokenUser) {
            console.log('👤 AuthenticationService: Successfully extracted registration user from token:', tokenUser.email);
            authUser = tokenUser;
          } else {
            console.log('👤 AuthenticationService: Could not extract registration user from token, creating user object from registration data...');
            
            // Use registration data to create user object
            authUser = {
              userId: 0, // Will be updated when we get actual user ID
              email: userData.email.toLowerCase(),
              firstName: userData.firstName,
              lastName: userData.lastName,
              fullName: `${userData.firstName} ${userData.lastName}`.trim(),
              role: userData.role,
              isActive: true,
              createdAt: new Date().toISOString()
            };
            
            console.log('👤 AuthenticationService: Created user object from registration data');
          }
        }
        
        const authResult = {
          user: authUser,
          isAuthenticated: true
        };
        
        console.log('👤 AuthenticationService: Registration process completed successfully');
        console.log('👤 AuthenticationService: Final registration user object:', {
          userId: authUser.userId,
          email: authUser.email,
          fullName: authUser.fullName,
          role: authUser.role
        });
        
        return Result.success(authResult);
        
      } catch (mappingError) {
        console.error('👤 AuthenticationService: Registration user processing failed:', mappingError);
        
        // Fallback with registration data
        const fallbackUser: AuthUser = {
          userId: 0,
          email: userData.email.toLowerCase(),
          firstName: userData.firstName,
          lastName: userData.lastName,
          fullName: `${userData.firstName} ${userData.lastName}`.trim(),
          role: userData.role,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        console.warn('👤 AuthenticationService: Using fallback user from registration data due to mapping error');
        
        return Result.success({
          user: fallbackUser,
          isAuthenticated: true
        });
      }

    } catch (error: any) {
      console.error('👤 AuthenticationService: Unexpected error during registration:', error);
      console.error('👤 AuthenticationService: Registration error stack:', error.stack);
      return Result.failure(
        new BusinessError('Unexpected error during registration', 'UNKNOWN_ERROR', error.message || error)
      );
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<Result<void, BusinessError>> {
    try {
      console.log('👤 AuthenticationService: Starting logout process');
      await this.authApiService.logout();
      console.log('👤 AuthenticationService: Logout completed successfully');
      return Result.success(undefined);
    } catch (error) {
      console.warn('👤 AuthenticationService: Logout API call failed, but clearing local tokens anyway');
      // Even if API call fails, we consider logout successful locally
      return Result.success(undefined);
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshAuthentication(): Promise<Result<AuthenticationResult, BusinessError>> {
    try {
      console.log('👤 AuthenticationService: Starting token refresh');
      const result = await this.authApiService.refreshToken();

      if (result.isFailure) {
        console.error('👤 AuthenticationService: Token refresh failed:', result.error.message);
        return Result.failure(
          new BusinessError('Token refresh failed', 'REFRESH_ERROR', result.error.message)
        );
      }

      const authResponse = result.value;
      console.log('👤 AuthenticationService: Token refresh successful');
      
      let authUser: AuthUser;
      
      if (authResponse.user) {
        authUser = this.mapUserInfoToAuthUser(authResponse.user);
      } else {
        // Try to get from token or create minimal user
        authUser = this.getCurrentUserFromToken() || {
          userId: 0,
          email: 'unknown@email.com',
          firstName: '',
          lastName: '',
          fullName: 'Unknown User',
          role: 'Member',
          isActive: true,
          createdAt: new Date().toISOString()
        };
      }

      return Result.success({
        user: authUser,
        isAuthenticated: true
      });

    } catch (error) {
      console.error('👤 AuthenticationService: Unexpected error during token refresh:', error);
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
        console.log('👤 AuthenticationService: User not authenticated');
        return Result.success(null);
      }

      console.log('👤 AuthenticationService: Getting current user from API');
      const result = await this.authApiService.getCurrentUser();

      if (result.isFailure) {
        console.warn('👤 AuthenticationService: Failed to get user from API, trying token fallback');
        
        // Fallback to token-based user info
        const tokenUser = this.getCurrentUserFromToken();
        if (tokenUser) {
          console.log('👤 AuthenticationService: Successfully got user from token fallback');
          return Result.success(tokenUser);
        }
        
        return Result.failure(
          new BusinessError('Failed to get current user', 'USER_FETCH_ERROR', result.error.message)
        );
      }

      const authUser = this.mapUserInfoToAuthUser(result.value);
      console.log('👤 AuthenticationService: Successfully got current user from API');
      return Result.success(authUser);

    } catch (error) {
      console.error('👤 AuthenticationService: Unexpected error while getting current user:', error);
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
   * Get current user from stored token (synchronous) - Enhanced for backend JWT format
   */
  getCurrentUserFromToken(): AuthUser | null {
    const decodedToken = TokenService.getCurrentUser();
    if (!decodedToken) {
      console.log('👤 AuthenticationService: No decoded token available');
      return null;
    }

    try {
      // Map the JWT claims to your AuthUser format
      // Your backend might use different claim names
      const authUser: AuthUser = {
        userId: decodedToken.userId || 0,
        email: decodedToken.email || 'unknown@email.com',
        firstName: decodedToken.given_name || 
                   decodedToken.name?.split(' ')[0] || 
                   '',
        lastName: decodedToken.family_name || 
                  decodedToken.name?.split(' ').slice(1).join(' ') || 
                  '',
        fullName: decodedToken.name || 
                  decodedToken.fullName || 
                  `${decodedToken.given_name || ''} ${decodedToken.family_name || ''}`.trim() ||
                  decodedToken.email ||
                  'Unknown User',
        role: decodedToken.role || 'Member',
        isActive: true,
        createdAt: new Date(decodedToken.iat * 1000).toISOString()
      };

      console.log('👤 AuthenticationService: Successfully mapped user from token:', authUser.email);
      return authUser;
    } catch (error) {
      console.error('👤 AuthenticationService: Error mapping token to user:', error);
      return null;
    }
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
    console.log('👤 AuthenticationService: Clearing authentication state');
    TokenService.clearTokens();
  }

  /**
   * Map API UserInfo to domain AuthUser - Updated to be more flexible
   */
  private mapUserInfoToAuthUser(userInfo: UserInfo): AuthUser {
  try {
    console.log('👤 AuthenticationService: Mapping user info:', userInfo);
    
    if (!userInfo) {
      throw new Error('UserInfo is null or undefined');
    }

    // 🔧 CRITICAL FIX: If server response doesn't have role, get it from token
    let userRole = userInfo.role;
    
    if (!userRole) {
      console.warn('👤 AuthenticationService: Server response missing role, getting from token...');
      const tokenUser = this.getCurrentUserFromToken();
      if (tokenUser && tokenUser.role) {
        userRole = tokenUser.role;
        console.log('👤 AuthenticationService: Retrieved role from token:', userRole);
      } else {
        userRole = 'Member'; // fallback
        console.warn('👤 AuthenticationService: Could not get role from token, using fallback');
      }
    }

    // Handle the mapped user info from your backend
    const authUser: AuthUser = {
      userId: userInfo.userId || 0,
      email: userInfo.email || 'unknown@email.com',
      firstName: userInfo.firstName || '',
      lastName: userInfo.lastName || '',
      fullName: userInfo.fullName || 
              `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() || 
              userInfo.email || 
              'Unknown User',
      role: userRole, // 🔧 Use the preserved/retrieved role
      isActive: userInfo.isActive !== false,
      createdAt: userInfo.createdAt || new Date().toISOString()
    };

    console.log('👤 AuthenticationService: Mapped auth user with preserved role:', authUser);
    return authUser;
    
  } catch (error) {
    console.error('👤 AuthenticationService: User mapping error:', error);
    console.error('👤 AuthenticationService: Input userInfo:', userInfo);
    throw new Error(`Failed to map user info: ${error}`);
  }
}
}