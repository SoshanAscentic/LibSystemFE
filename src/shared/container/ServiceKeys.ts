export const SERVICE_KEYS = {
  // Infrastructure
  API_CLIENT: 'ApiClient',
  AUTH_API_SERVICE: 'AuthApiService',
  MEMBERS_API_SERVICE: 'MembersApiService',
  
  // Repositories
  BOOK_REPOSITORY: 'BookRepository',
  MEMBER_REPOSITORY: 'MemberRepository',
  USER_REPOSITORY: 'UserRepository',
  
  // Domain Services
  AUTHENTICATION_SERVICE: 'AuthenticationService',
  BOOK_SERVICE: 'BookService',
  MEMBER_SERVICE: 'MemberService',
  AUTH_SERVICE: 'AuthService',
  
  // Validation Services
  AUTH_VALIDATION_SERVICE: 'AuthValidationService',
  BOOK_VALIDATION_SERVICE: 'BookValidationService',
  MEMBER_VALIDATION_SERVICE: 'MemberValidationService',

  // Use Cases - Books
  CREATE_BOOK_USE_CASE: 'CreateBookUseCase',
  DELETE_BOOK_USE_CASE: 'DeleteBookUseCase',
  GET_BOOKS_USE_CASE: 'GetBooksUseCase',

  // Use Cases - Members
  GET_MEMBERS_USE_CASE: 'GetMembersUseCase',
  GET_MEMBER_BY_ID_USE_CASE: 'GetMemberUseCase',
  REGISTER_MEMBER_USE_CASE: 'RegisterMemberUseCase',
  
  // Application Controllers
  BOOKS_CONTROLLER: 'BooksController',
  MEMBERS_CONTROLLER: 'MembersController',
  AUTH_CONTROLLER: 'AuthController',
  
  // UI Services
  NAVIGATION_SERVICE: 'NavigationService',
  NOTIFICATION_SERVICE: 'NotificationService',
} as const;