import { ValidationResult } from '../../shared/interfaces/common';
import { LoginCredentials, RegisterData } from './AuthenticationService';
import { ChangePasswordRequest } from '../../infrastructure/api/AuthApiService';

export class AuthValidationService {
  
  validateLoginCredentials(credentials: LoginCredentials): ValidationResult {
    const errors: string[] = [];

    // Email validation
    if (!credentials.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email.trim())) {
      errors.push('Please enter a valid email address');
    }

    // Password validation
    if (!credentials.password) {
      errors.push('Password is required');
    } else if (credentials.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateRegistrationData(userData: RegisterData): ValidationResult {
    const errors: string[] = [];

    // First name validation
    if (!userData.firstName?.trim()) {
      errors.push('First name is required');
    } else if (userData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    } else if (userData.firstName.trim().length > 50) {
      errors.push('First name must be less than 50 characters');
    }

    // Last name validation
    if (!userData.lastName?.trim()) {
      errors.push('Last name is required');
    } else if (userData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    } else if (userData.lastName.trim().length > 50) {
      errors.push('Last name must be less than 50 characters');
    }

    // Email validation
    if (!userData.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email.trim())) {
      errors.push('Please enter a valid email address');
    } else if (userData.email.trim().length > 255) {
      errors.push('Email must be less than 255 characters');
    }

    // Password validation
    if (!userData.password) {
      errors.push('Password is required');
    } else {
      if (userData.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(userData.password)) {
        errors.push('Password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(userData.password)) {
        errors.push('Password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(userData.password)) {
        errors.push('Password must contain at least one number');
      }
    }

    // Confirm password validation
    if (!userData.confirmPassword) {
      errors.push('Please confirm your password');
    } else if (userData.password !== userData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    // Role validation
    if (!userData.role?.trim()) {
      errors.push('Role is required');
    } else if (!['Member', 'MinorStaff', 'ManagementStaff'].includes(userData.role)) {
      errors.push('Invalid role selected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validatePasswordChange(passwordData: ChangePasswordRequest): ValidationResult {
    const errors: string[] = [];

    // Current password validation
    if (!passwordData.currentPassword) {
      errors.push('Current password is required');
    }

    // New password validation
    if (!passwordData.newPassword) {
      errors.push('New password is required');
    } else {
      if (passwordData.newPassword.length < 8) {
        errors.push('New password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])/.test(passwordData.newPassword)) {
        errors.push('New password must contain at least one lowercase letter');
      }
      if (!/(?=.*[A-Z])/.test(passwordData.newPassword)) {
        errors.push('New password must contain at least one uppercase letter');
      }
      if (!/(?=.*\d)/.test(passwordData.newPassword)) {
        errors.push('New password must contain at least one number');
      }
    }

    // Confirm password validation
    if (!passwordData.confirmPassword) {
      errors.push('Please confirm your new password');
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('New passwords do not match');
    }

    // Same password check
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push('New password must be different from current password');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}