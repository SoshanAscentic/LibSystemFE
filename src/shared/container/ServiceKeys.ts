export const SERVICE_KEYS = {
  // Infrastructure
  API_CLIENT: 'ApiClient',
  AUTH_API_SERVICE: 'AuthApiService',
  
  // Repositories
  BOOK_REPOSITORY: 'BookRepository',
  USER_REPOSITORY: 'UserRepository',
  
  // Domain Services
  AUTHENTICATION_SERVICE: 'AuthenticationService',
  BOOK_SERVICE: 'BookService',
  AUTH_SERVICE: 'AuthService',
  
  // Validation Services
  AUTH_VALIDATION_SERVICE: 'AuthValidationService',
  BOOK_VALIDATION_SERVICE: 'BookValidationService',
  
  // Application Controllers
  BOOKS_CONTROLLER: 'BooksController',
  AUTH_CONTROLLER: 'AuthController',
  
  // UI Services
  NAVIGATION_SERVICE: 'NavigationService',
  NOTIFICATION_SERVICE: 'NotificationService',
} as const;