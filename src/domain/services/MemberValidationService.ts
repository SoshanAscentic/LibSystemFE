import { ValidationResult } from '../../shared/interfaces/common';
import { CreateMemberDto } from '../dtos/MemberDto';

export class MemberValidationService {
  
  validateCreateMember(data: CreateMemberDto): ValidationResult {
    const errors: string[] = [];

    // First name validation
    if (!data.firstName?.trim()) {
      errors.push('First name is required');
    } else if (data.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    } else if (data.firstName.trim().length > 50) {
      errors.push('First name must be less than 50 characters');
    }

    // Last name validation
    if (!data.lastName?.trim()) {
      errors.push('Last name is required');
    } else if (data.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    } else if (data.lastName.trim().length > 50) {
      errors.push('Last name must be less than 50 characters');
    }

    // Email validation
    if (!data.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.push('Please enter a valid email address');
    } else if (data.email.trim().length > 255) {
      errors.push('Email must be less than 255 characters');
    }

    // Member type validation
    if (data.memberType === undefined || data.memberType === null) {
      errors.push('Member type is required');
    } else if (![0, 1, 2].includes(data.memberType)) {
      errors.push('Invalid member type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateSearchQuery(query: string): ValidationResult {
    const errors: string[] = [];

    if (query && query.length < 2) {
      errors.push('Search query must be at least 2 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}