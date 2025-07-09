export const SERVICE_KEYS = {
  // Infrastructure
  API_CLIENT: 'ApiClient',
  AUTH_API_SERVICE: 'AuthApiService',
  MEMBERS_API_SERVICE: 'MembersApiService',
  BORROWING_API_SERVICE: 'BorrowingApiService',
  
  // Repositories
  BOOK_REPOSITORY: 'BookRepository',
  MEMBER_REPOSITORY: 'MemberRepository',
  USER_REPOSITORY: 'UserRepository',
  BORROWING_REPOSITORY: 'BorrowingRepository',
  
  // Domain Services
  AUTHENTICATION_SERVICE: 'AuthenticationService',
  BOOK_SERVICE: 'BookService',
  MEMBER_SERVICE: 'MemberService',
  BORROWING_SERVICE: 'BorrowingService',
  AUTH_SERVICE: 'AuthService',
  
  // Validation Services
  AUTH_VALIDATION_SERVICE: 'AuthValidationService',
  BOOK_VALIDATION_SERVICE: 'BookValidationService',
  MEMBER_VALIDATION_SERVICE: 'MemberValidationService',
  BORROWING_VALIDATION_SERVICE: 'BorrowingValidationService',

  // Use Cases - Books
  CREATE_BOOK_USE_CASE: 'CreateBookUseCase',
  DELETE_BOOK_USE_CASE: 'DeleteBookUseCase',
  GET_BOOKS_USE_CASE: 'GetBooksUseCase',

  // Use Cases - Members
  GET_MEMBERS_USE_CASE: 'GetMembersUseCase',
  GET_MEMBER_BY_ID_USE_CASE: 'GetMemberUseCase',
  REGISTER_MEMBER_USE_CASE: 'RegisterMemberUseCase',

  // Use Cases - Borrowing
  BORROW_BOOK_USE_CASE: 'BorrowBookUseCase',
  RETURN_BOOK_USE_CASE: 'ReturnBookUseCase',
  GET_BORROWING_HISTORY_USE_CASE: 'GetBorrowingHistoryUseCase',
  GET_MEMBER_BORROWING_STATUS_USE_CASE: 'GetMemberBorrowingStatusUseCase',
  
  // Application Controllers
  BOOKS_CONTROLLER: 'BooksController',
  MEMBERS_CONTROLLER: 'MembersController',
  AUTH_CONTROLLER: 'AuthController',
  BORROWING_CONTROLLER: 'BorrowingController',
  
  // UI Services
  NAVIGATION_SERVICE: 'NavigationService',
  NOTIFICATION_SERVICE: 'NotificationService',
} as const;