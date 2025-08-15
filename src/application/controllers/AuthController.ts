import { ControllerResult } from '../../shared/interfaces/common';
import { INavigationService, INotificationService } from '../../shared/interfaces/services';
import { AuthenticationService, LoginCredentials, RegisterData } from '../../domain/services/Auth/AuthenticationService';

export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export class AuthController {
  constructor(
    private authenticationService: AuthenticationService,
    private navigationService: INavigationService,
    private notificationService: INotificationService
  ) {}

  async handleLogin(data: LoginData): Promise<ControllerResult> {
    try {
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe
      };

      const result = await this.authenticationService.login(credentials);
      
      if (result.isSuccess) {
        this.notificationService.showSuccess(
          'Welcome back!',
          `Hello ${result.value.user.firstName}, you have successfully signed in.`
        );
        
        this.navigationService.navigateToDashboard();
        
        return ControllerResult.success(result.value.user);
      } else {
        const errorMessage = this.getErrorMessage(result.error.message);
        this.notificationService.showError(
          'Login Failed',
          errorMessage
        );
        
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      this.notificationService.showError(
        'Login Failed',
        errorMessage
      );
      
      return ControllerResult.failure(errorMessage);
    }
  }

  async handleRegister(data: RegisterFormData): Promise<ControllerResult> {
    try {
      const registerData: RegisterData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role
      };

      const result = await this.authenticationService.register(registerData);
      
      if (result.isSuccess) {
        this.notificationService.showSuccess(
          'Account Created Successfully!',
          `Welcome to LibraryMS, ${result.value.user.firstName}! You can now access all features.`
        );
        
        this.navigationService.navigateToDashboard();
        
        return ControllerResult.success(result.value.user);
      } else {
        const errorMessage = this.getErrorMessage(result.error.message);
        this.notificationService.showError(
          'Registration Failed',
          errorMessage
        );
        
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      this.notificationService.showError(
        'Registration Failed',
        errorMessage
      );
      
      return ControllerResult.failure(errorMessage);
    }
  }

  async handleForgotPassword(email: string): Promise<ControllerResult> {
    try {
      const result = await this.authenticationService.requestPasswordReset(email);
      
      if (result.isSuccess) {
        this.notificationService.showSuccess(
          'Password Reset Requested',
          'If an account with that email exists, you will receive password reset instructions.'
        );
        
        return ControllerResult.success();
      } else {
        const errorMessage = this.getErrorMessage(result.error.message);
        this.notificationService.showError(
          'Password Reset Failed',
          errorMessage
        );
        
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      this.notificationService.showError(
        'Password Reset Failed',
        errorMessage
      );
      
      return ControllerResult.failure(errorMessage);
    }
  }

  async handleLogout(): Promise<ControllerResult> {
    try {
      const result = await this.authenticationService.logout();
      
      this.notificationService.showInfo(
        'Goodbye!',
        'You have been logged out successfully.'
      );
      
      // Navigate to login page
      this.navigationService.navigateToLogin();
      
      return ControllerResult.success();
    } catch (error: any) {
      // Even if logout fails on the server, clear local state
      this.notificationService.showInfo(
        'Goodbye!',
        'You have been logged out.'
      );
      
      this.navigationService.navigateToLogin();
      
      return ControllerResult.success();
    }
  }

  async handleRefreshAuthentication(): Promise<ControllerResult> {
    try {
      const result = await this.authenticationService.refreshAuthentication();
      
      if (result.isSuccess) {
        return ControllerResult.success(result.value.user);
      } else {
        // Refresh failed, redirect to login
        this.handleSessionExpired();
        return ControllerResult.failure('Session expired');
      }
    } catch (error: any) {
      this.handleSessionExpired();
      return ControllerResult.failure('Session refresh failed');
    }
  }

  handleSessionExpired(): void {
    this.authenticationService.clearAuthentication();
    this.notificationService.showWarning(
      'Session Expired',
      'Your session has expired. Please login again.'
    );
    this.navigationService.navigateToLogin();
  }

  getCurrentUser() {
    return this.authenticationService.getCurrentUserFromToken();
  }

  isAuthenticated(): boolean {
    return this.authenticationService.isAuthenticated();
  }

  needsTokenRefresh(): boolean {
    return this.authenticationService.needsTokenRefresh();
  }

  /**
   * Map API error messages to user-friendly messages
   */
  private getErrorMessage(apiErrorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Invalid credentials': 'The email or password you entered is incorrect.',
      'User not found': 'No account found with this email address.',
      'Email already exists': 'An account with this email already exists.',
      'Invalid email format': 'Please enter a valid email address.',
      'Password too weak': 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
      'Account locked': 'Your account has been temporarily locked. Please try again later.',
      'Account not verified': 'Please verify your email address before logging in.',
      'Account inactive': 'Your account is inactive. Please contact support.',
      'Network error': 'Unable to connect to the server. Please check your internet connection.',
      'Server error': 'Server error occurred. Please try again later.'
    };

    // Check for specific error patterns
    for (const [key, value] of Object.entries(errorMap)) {
      if (apiErrorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Return original message if no mapping found
    return apiErrorMessage || 'An error occurred. Please try again.';
  }
}