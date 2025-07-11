import { BusinessError, ValidationError, NotFoundError } from '../../shared/types/errors';

export class ErrorMapper {
  static fromApiError(apiError: any): BusinessError {
    if (!apiError) {
      return new BusinessError('Unknown error occurred');
    }

    // Handle validation errors
    if (apiError.code === 'VALIDATION_ERROR' || apiError.validationErrors) {
      const validationMessages = Object.entries(apiError.validationErrors || {})
        .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
        .join('; ');
      
      return new ValidationError(
        validationMessages || apiError.message || 'Validation failed'
      );
    }

    // Handle not found errors
    if (apiError.code === 'NOT_FOUND') {
      return new NotFoundError(
        apiError.details?.resource || 'Resource',
        apiError.details?.id || 'unknown'
      );
    }

    // Handle business errors
    return new BusinessError(
      apiError.message || 'An error occurred',
      apiError.code,
      apiError.details
    );
  }

  static toUserMessage(error: BusinessError): string {
    switch (error.name) {
      case 'ValidationError':
        return `Please check your input: ${error.message}`;
      case 'NotFoundError':
        return `The requested item was not found: ${error.message}`;
      case 'BusinessError':
        if (error.code === 'DUPLICATE_BOOK') {
          return 'This book already exists in the library.';
        }
        if (error.code === 'BOOK_BORROWED') {
          return 'This book is currently borrowed and cannot be deleted.';
        }
        return error.message;
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}