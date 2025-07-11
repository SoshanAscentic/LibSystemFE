import { Result } from '../../../shared/types/Result';
import { BusinessError, ValidationError } from '../../../shared/types/errors';
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
    // 🔧 FIX: Use proper backend URL
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7033';
    console.log('🔗 AuthenticationService: Using API base URL:', this.baseURL);
  }

  /**
   * SECURE Login - With fallback to old endpoint if secure endpoint not available
   */
  async login(credentials: LoginCredentials): Promise<Result<AuthenticationResult, BusinessError>> {
    try {
      console.log('🔐 AuthenticationService: Starting SECURE login process for:', credentials.email);
      
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

      console.log('🔐 AuthenticationService: Attempting secure login...');
      
      // Try secure endpoint first
      try {
        const response = await fetch(`${this.baseURL}/api/auth/secure/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(loginRequest)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ AuthenticationService: Secure login successful');

          if (data.success && data.data) {
            const authUser = this.mapServerResponseToAuthUser(data.data);
            
            return Result.success({
              user: authUser,
              isAuthenticated: true
            });
          }
        } else if (response.status === 404) {
          console.log('⚠️ AuthenticationService: Secure endpoint not found, falling back to old endpoint');
          throw new Error('Secure endpoint not available');
        }

        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || errorData.message || 'Login failed';
        
        return Result.failure(new BusinessError('Login failed', 'LOGIN_ERROR', errorMessage));

      } catch (secureError) {
        console.log('⚠️ AuthenticationService: Secure login failed, trying fallback to old endpoint');
        
        // Fallback to old endpoint
        try {
          const fallbackResponse = await fetch(`${this.baseURL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginRequest)
          });

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            console.log('✅ AuthenticationService: Fallback login successful');

            if (fallbackData.success && fallbackData.data) {
              const authUser = this.mapServerResponseToAuthUser(fallbackData.data);
              
              // Store token in localStorage for fallback compatibility
              if (fallbackData.data.token) {
                localStorage.setItem('library_access_token', fallbackData.data.token);
              }
              
              return Result.success({
                user: authUser,
                isAuthenticated: true
              });
            }
          }

          const fallbackErrorData = await fallbackResponse.json().catch(() => ({}));
          const fallbackErrorMessage = fallbackErrorData.error?.message || 'Login failed';
          
          return Result.failure(new BusinessError('Login failed', 'LOGIN_ERROR', fallbackErrorMessage));

        } catch (fallbackError) {
          console.error('❌ AuthenticationService: Both secure and fallback login failed');
          return Result.failure(new BusinessError('Login failed', 'LOGIN_ERROR', 'Unable to authenticate'));
        }
      }

    } catch (error: any) {
      console.error('❌ AuthenticationService: Unexpected error during login:', error);
      return Result.failure(
        new BusinessError('Unexpected error during login', 'UNKNOWN_ERROR', error.message || error)
      );
    }
  }

  /**
   * SECURE Register - With fallback
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

      // Try secure endpoint first, fallback to old endpoint
      try {
        const response = await fetch('/api/auth/secure/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(registerRequest)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const authUser = this.mapServerResponseToAuthUser(data.data);
            return Result.success({
              user: authUser,
              isAuthenticated: true
            });
          }
        }
      } catch (secureError) {
        console.log('⚠️ Using fallback registration endpoint');
      }

      // Fallback to old endpoint
      const fallbackResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerRequest)
      });

      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        if (data.success && data.data) {
          const authUser = this.mapServerResponseToAuthUser(data.data);
          
          // Store token for fallback compatibility
          if (data.data.token) {
            localStorage.setItem('library_access_token', data.data.token);
          }
          
          return Result.success({
            user: authUser,
            isAuthenticated: true
          });
        }
      }

      return Result.failure(new BusinessError('Registration failed', 'REGISTRATION_ERROR'));

    } catch (error: any) {
      return Result.failure(
        new BusinessError('Unexpected error during registration', 'UNKNOWN_ERROR', error.message || error)
      );
    }
  }

  /**
   * SECURE Logout - With fallback
   */
  async logout(): Promise<Result<void, BusinessError>> {
    try {
      console.log('🔐 AuthenticationService: Starting logout');
      
      // Try secure logout first
      try {
        await fetch('/api/auth/secure/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (secureError) {
        console.log('⚠️ Secure logout failed, using fallback');
      }

      // Clear localStorage (for fallback compatibility)
      localStorage.removeItem('library_access_token');
      localStorage.removeItem('library_refresh_token');
      localStorage.removeItem('library_token_type');
      localStorage.removeItem('library_expires_at');
      
      console.log('✅ AuthenticationService: Logout completed');
      return Result.success(undefined);
    } catch (error) {
      console.warn('⚠️ AuthenticationService: Logout API failed, but considering successful locally');
      return Result.success(undefined);
    }
  }

  /**
   * SECURE Get Current User - With fallback
   */
  async getCurrentUser(): Promise<Result<AuthUser | null, BusinessError>> {
    try {
      console.log('🔐 AuthenticationService: Getting current user');
      
      // Try secure endpoint first
      try {
        const response = await fetch('/api/auth/secure/me', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const authUser = this.mapServerResponseToAuthUser(data.data);
            return Result.success(authUser);
          }
        }
      } catch (secureError) {
        console.log('⚠️ Secure getCurrentUser failed, using fallback');
      }

      // Fallback: Try old endpoint with token
      const token = localStorage.getItem('library_access_token');
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const authUser = this.mapServerResponseToAuthUser(data.data);
              return Result.success(authUser);
            }
          }
        } catch (fallbackError) {
          console.log('⚠️ Fallback getCurrentUser also failed');
        }
      }

      return Result.success(null);
    } catch (error) {
      console.error('❌ AuthenticationService: Error getting current user:', error);
      return Result.failure(new BusinessError('Unexpected error while getting current user', 'UNKNOWN_ERROR', error));
    }
  }

  /**
   * SECURE Authentication Check - With fallback
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      // Try secure verification first
      try {
        const response = await fetch('/api/auth/secure/verify', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          return true;
        }
      } catch (secureError) {
        console.log('⚠️ Secure auth check failed, using fallback');
      }

      // Fallback: Check localStorage token
      const token = localStorage.getItem('library_access_token');
      if (token) {
        try {
          // Try to decode token to check if it's valid
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            const now = Math.floor(Date.now() / 1000);
            return payload.exp > now;
          }
        } catch (tokenError) {
          console.log('⚠️ Token validation failed');
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ AuthenticationService: Authentication check failed:', error);
      return false;
    }
  }

  /**
   * SECURE Token Refresh - With fallback
   */
  async refreshAuthentication(): Promise<Result<AuthenticationResult, BusinessError>> {
    try {
      console.log('🔐 AuthenticationService: Refreshing authentication');
      
      // Try secure refresh first
      try {
        const response = await fetch('/api/auth/secure/refresh', {
          method: 'POST',
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const authUser = this.mapServerResponseToAuthUser(data.data);
            return Result.success({
              user: authUser,
              isAuthenticated: true
            });
          }
        }
      } catch (secureError) {
        console.log('⚠️ Secure refresh failed');
      }

      return Result.failure(new BusinessError('Token refresh failed', 'REFRESH_ERROR'));
    } catch (error) {
      return Result.failure(new BusinessError('Unexpected error during token refresh', 'UNKNOWN_ERROR', error));
    }
  }

  /**
   * Change password
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<Result<void, BusinessError>> {
    try {
      const validation = this.validationService.validatePasswordChange(passwordData);
      if (!validation.isValid) {
        return Result.failure(
          new ValidationError(validation.errors.join(', '), 'passwordData', passwordData)
        );
      }

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(passwordData)
      });

      if (response.ok) {
        return Result.success(undefined);
      }

      return Result.failure(new BusinessError('Password change failed', 'PASSWORD_CHANGE_ERROR'));
    } catch (error) {
      return Result.failure(new BusinessError('Unexpected error during password change', 'UNKNOWN_ERROR', error));
    }
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

      const response = await fetch('/api/auth/forgot-password', {
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
   * Map server response to AuthUser
   */
  private mapServerResponseToAuthUser(serverData: any): AuthUser {
    return {
      userId: serverData.userId || serverData.id || 0,
      email: serverData.email || '',
      firstName: serverData.firstName || serverData.fullName?.split(' ')[0] || '',
      lastName: serverData.lastName || serverData.fullName?.split(' ').slice(1).join(' ') || '',
      fullName: serverData.fullName || `${serverData.firstName || ''} ${serverData.lastName || ''}`.trim() || serverData.email || 'Unknown User',
      role: serverData.role || 'Member',
      isActive: serverData.isActive !== false,
      createdAt: serverData.createdAt || new Date().toISOString()
    };
  }
}