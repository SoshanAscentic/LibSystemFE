export const SERVICE_KEYS = {
  // Infrastructure
  API_CLIENT: 'ApiClient',
  AUTH_API_SERVICE: 'AuthApiService',
  MEMBERS_API_SERVICE: 'MembersApiService', // NEW
  
  // Repositories
  BOOK_REPOSITORY: 'BookRepository',
  MEMBER_REPOSITORY: 'MemberRepository', // NEW
  USER_REPOSITORY: 'UserRepository',
  
  // Domain Services
  AUTHENTICATION_SERVICE: 'AuthenticationService',
  BOOK_SERVICE: 'BookService',
  MEMBER_SERVICE: 'MemberService', // NEW
  AUTH_SERVICE: 'AuthService',
  
  // Validation Services
  AUTH_VALIDATION_SERVICE: 'AuthValidationService',
  BOOK_VALIDATION_SERVICE: 'BookValidationService',
  MEMBER_VALIDATION_SERVICE: 'MemberValidationService', // NEW
  
  // Application Controllers
  BOOKS_CONTROLLER: 'BooksController',
  MEMBERS_CONTROLLER: 'MembersController', // NEW
  AUTH_CONTROLLER: 'AuthController',
  
  // UI Services
  NAVIGATION_SERVICE: 'NavigationService',
  NOTIFICATION_SERVICE: 'NotificationService',
} as const;