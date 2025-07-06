import { ControllerResult } from '../../shared/interfaces/common';
import { INavigationService, INotificationService } from '../../shared/interfaces/services';

// For now, this is a placeholder since we don't have full auth implementation
export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export class AuthController {
  constructor(
    private navigationService: INavigationService,
    private notificationService: INotificationService
  ) {}

  async handleLogin(data: LoginData): Promise<ControllerResult> {
    try {
      // Simulate API call - replace with actual auth service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Demo login logic
      if (data.email === "admin@library.com" && data.password === "admin123") {
        this.notificationService.showSuccess(
          'Welcome back!',
          'You have successfully signed in to your account.'
        );
        
        this.navigationService.navigateToDashboard();
        
        return ControllerResult.success({
          userId: 1,
          email: data.email,
          name: "Soshan Wijayarathne",
          role: "Administrator"
        });
      } else {
        this.notificationService.showError(
          'Invalid credentials',
          'Please check your email and password and try again.'
        );
        
        return ControllerResult.failure('Invalid credentials');
      }
    } catch (error) {
      this.notificationService.showError(
        'Login failed',
        'An unexpected error occurred. Please try again.'
      );
      
      return ControllerResult.failure('Login failed');
    }
  }

  async handleRegister(data: RegisterData): Promise<ControllerResult> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.notificationService.showSuccess(
        'Account created successfully!',
        'Welcome to LibraryMS. You can now sign in with your credentials.'
      );
      
      return ControllerResult.success({
        userId: Date.now(),
        email: data.email,
        name: `${data.firstName} ${data.lastName}`,
        role: data.role
      });
      
    } catch (error) {
      this.notificationService.showError(
        'Registration failed',
        'An unexpected error occurred. Please try again.'
      );
      
      return ControllerResult.failure('Registration failed');
    }
  }

  handleForgotPassword(): void {
    this.notificationService.showInfo(
      'Forgot Password',
      'Password reset functionality will be available soon.'
    );
  }

  handleLogout(): ControllerResult {
    this.notificationService.showInfo('Goodbye!', 'You have been logged out.');
    return ControllerResult.success();
  }
}