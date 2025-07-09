import { ValidationResult } from '../../shared/interfaces/common';
import { BorrowBookDto, ReturnBookDto } from '../dtos/BorrowingDto';

export class BorrowingValidationService {
  
  validateBorrowBook(data: BorrowBookDto): ValidationResult {
    const errors: string[] = [];

    // Book ID validation
    if (!data.bookId || data.bookId <= 0) {
      errors.push('Valid book ID is required');
    }

    // Member ID validation
    if (!data.memberId || data.memberId <= 0) {
      errors.push('Valid member ID is required');
    }

    // Due date validation (if provided)
    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      const today = new Date();
      
      if (isNaN(dueDate.getTime())) {
        errors.push('Due date must be a valid date');
      } else if (dueDate <= today) {
        errors.push('Due date must be in the future');
      } else {
        // Check if due date is reasonable (not more than 90 days)
        const maxDays = 90;
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > maxDays) {
          errors.push(`Due date cannot be more than ${maxDays} days from today`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateReturnBook(data: ReturnBookDto): ValidationResult {
    const errors: string[] = [];

    // Borrowing ID validation
    if (!data.borrowingId || data.borrowingId <= 0) {
      errors.push('Valid borrowing ID is required');
    }

    // Return date validation (if provided)
    if (data.returnDate) {
      const returnDate = new Date(data.returnDate);
      
      if (isNaN(returnDate.getTime())) {
        errors.push('Return date must be a valid date');
      } else {
        const today = new Date();
        if (returnDate > today) {
          errors.push('Return date cannot be in the future');
        }
      }
    }

    // Condition validation (if provided)
    if (data.condition && data.condition.trim().length > 200) {
      errors.push('Condition description must be less than 200 characters');
    }

    // Notes validation (if provided)
    if (data.notes && data.notes.trim().length > 500) {
      errors.push('Notes must be less than 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateBorrowingFilters(filters: any): ValidationResult {
    const errors: string[] = [];

    // Date validations
    const dateFields = ['borrowedAfter', 'borrowedBefore', 'dueAfter', 'dueBefore', 'returnedAfter', 'returnedBefore'];
    
    dateFields.forEach(field => {
      if (filters[field]) {
        const date = new Date(filters[field]);
        if (isNaN(date.getTime())) {
          errors.push(`${field} must be a valid date`);
        }
      }
    });

    // ID validations
    if (filters.memberId && (filters.memberId <= 0 || !Number.isInteger(filters.memberId))) {
      errors.push('Member ID must be a positive integer');
    }

    if (filters.bookId && (filters.bookId <= 0 || !Number.isInteger(filters.bookId))) {
      errors.push('Book ID must be a positive integer');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}