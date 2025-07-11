import { ValidationResult } from '../../../shared/interfaces/common';
import { CreateBookDto } from '../../dtos/CreateBookDto';

export class BookValidationService {
  validateCreateBook(data: CreateBookDto): ValidationResult {
    const errors: string[] = [];

    // Title validation
    if (!data.title?.trim()) {
      errors.push('Title is required');
    } else if (data.title.trim().length < 2) {
      errors.push('Title must be at least 2 characters long');
    } else if (data.title.trim().length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    // Author validation
    if (!data.author?.trim()) {
      errors.push('Author is required');
    } else if (data.author.trim().length < 2) {
      errors.push('Author must be at least 2 characters long');
    } else if (data.author.trim().length > 100) {
      errors.push('Author must be less than 100 characters');
    }

    // Publication year validation
    const currentYear = new Date().getFullYear();
    if (!data.publicationYear) {
      errors.push('Publication year is required');
    } else if (data.publicationYear < 1450) {
      errors.push('Publication year must be 1450 or later');
    } else if (data.publicationYear > currentYear) {
      errors.push('Publication year cannot be in the future');
    }

    // Category validation
    if (data.category === undefined || data.category === null) {
      errors.push('Category is required');
    } else if (![0, 1, 2].includes(data.category)) {
      errors.push('Invalid category');
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