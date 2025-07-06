export const SERVICE_KEYS = {
  // Infrastructure
  API_CLIENT: 'ApiClient',
  
  // Repositories
  BOOK_REPOSITORY: 'BookRepository',
  USER_REPOSITORY: 'UserRepository',
  
  // Domain Services
  BOOK_SERVICE: 'BookService',
  AUTH_SERVICE: 'AuthService',
  
  // Application Services
  BOOKS_CONTROLLER: 'BooksController',
  AUTH_CONTROLLER: 'AuthController',
  
  // UI Services
  NAVIGATION_SERVICE: 'NavigationService',
  NOTIFICATION_SERVICE: 'NotificationService',
} as const;

// src/shared/interfaces/common.ts
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ControllerResult {
  success: boolean;
  error?: string;
  data?: any;
}

export namespace ControllerResult {
  export const success = (data?: any): ControllerResult => ({
    success: true,
    data
  });

  export const failure = (error: string): ControllerResult => ({
    success: false,
    error
  });
}