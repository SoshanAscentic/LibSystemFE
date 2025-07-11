import { Container } from '../../shared/container/Container';
import { SERVICE_KEYS } from '../../shared/container/ServiceKeys';

// Infrastructure
import { ApiClient } from '../api/ApiClient';
import { AuthApiService } from '../api/AuthApiService';
import { MembersApiService } from '../api/MembersApiService';
import { BorrowingApiService } from '../api/BorrowingApiService';
import { ApiBookRepository } from '../repositories/ApiBookRepository';
import { ApiMemberRepository } from '../repositories/ApiMemberRepository';
import { ApiBorrowingRepository } from '../repositories/ApiBorrowingRepository';
import { NavigationServiceImpl } from '../services/NavigationServiceImpl';
import { NotificationService } from '../services/NotificationService';

// Domain Services
import { AuthenticationService } from '../../domain/services/Auth/AuthenticationService';
import { AuthValidationService } from '../../domain/services/Auth/AuthValidationService';
import { BookService } from '../../domain/services/Book/BookService';
import { BookValidationService } from '../../domain/services/Book/BookValidationService';
import { MemberService } from '../../domain/services/Member/MemberService';
import { MemberValidationService } from '../../domain/services/Member/MemberValidationService';
import { BorrowingService } from '../../domain/services/Borrowing/BorrowingService';
import { BorrowingValidationService } from '../../domain/services/Borrowing/BorrowingValidationService';

// Application Use Cases
import { CreateBookUseCase } from '../../application/useCases/Book/CreateBookUseCase';
import { DeleteBookUseCase } from '../../application/useCases/Book/DeleteBookUseCase';
import { GetBooksUseCase } from '../../application/useCases/Book/GetBookUseCase';

// Member Use Cases
import { GetMembersUseCase } from '../../application/useCases/Member/GetMembersUseCase';
import { GetMemberByIdUseCase } from '../../application/useCases/Member/GetMemberByIdUseCase';
import { RegisterMemberUseCase } from '../../application/useCases/Member/RegisterMemberUseCase';

// Borrowing Use Cases
import { BorrowBookUseCase } from '../../application/useCases/Borrowing/BorrowBookUseCase';
import { ReturnBookUseCase } from '../../application/useCases/Borrowing/ReturnBookUseCase';
import { GetBorrowingHistoryUseCase } from '../../application/useCases/Borrowing/GetBorrowingHistoryUseCase';
import { GetMemberBorrowingStatusUseCase } from '../../application/useCases/Borrowing/GetMemberBorrowingStatusUseCase';

// Application Controllers
import { BooksController } from '../../application/controllers/BooksController';
import { MembersController } from '../../application/controllers/MemberController';
import { AuthController } from '../../application/controllers/AuthController';
import { BorrowingController } from '../../application/controllers/BorrowingController';

export const configureDependencies = (
  container: Container, 
  navigate: (path: string | number, options?: { state?: any }) => void // Updated signature
): void => {
  console.log('Configuring dependencies...');
  try {
    // Infrastructure layer - API and External Services
    console.log('Registering infrastructure services...');
    container.registerSingleton(SERVICE_KEYS.API_CLIENT, () => {
      console.log('Creating ApiClient');
      return new ApiClient();
    });
    
    container.registerSingleton(SERVICE_KEYS.AUTH_API_SERVICE, () => {
      console.log('Creating AuthApiService');
      return new AuthApiService(container.resolve(SERVICE_KEYS.API_CLIENT));
    });

    container.registerSingleton(SERVICE_KEYS.MEMBERS_API_SERVICE, () => {
      console.log('Creating MembersApiService');
      return new MembersApiService(container.resolve(SERVICE_KEYS.API_CLIENT));
    });

    container.registerSingleton(SERVICE_KEYS.BORROWING_API_SERVICE, () => {
      console.log('Creating BorrowingApiService');
      return new BorrowingApiService(container.resolve(SERVICE_KEYS.API_CLIENT));
    });
    
    container.registerSingleton(SERVICE_KEYS.BOOK_REPOSITORY, () => {
      console.log('Creating BookRepository');
      return new ApiBookRepository(container.resolve(SERVICE_KEYS.API_CLIENT));
    });

    container.registerSingleton(SERVICE_KEYS.MEMBER_REPOSITORY, () => {
      console.log('Creating MemberRepository');
      return new ApiMemberRepository(container.resolve(SERVICE_KEYS.MEMBERS_API_SERVICE));
    });

    container.registerSingleton(SERVICE_KEYS.BORROWING_REPOSITORY, () => {
      console.log('Creating BorrowingRepository');
      return new ApiBorrowingRepository(container.resolve(SERVICE_KEYS.BORROWING_API_SERVICE));
    });

    // UI Services
    console.log('Registering UI services...');
    container.registerSingleton(SERVICE_KEYS.NAVIGATION_SERVICE, () => {
      console.log('🧭 Creating NavigationService');
      return new NavigationServiceImpl(navigate); 
    });

    container.registerSingleton(SERVICE_KEYS.NOTIFICATION_SERVICE, () => {
      console.log('Creating NotificationService');
      return new NotificationService();
    });

    // Domain Validation Services
    console.log('Registering validation services...');
    container.registerSingleton(SERVICE_KEYS.AUTH_VALIDATION_SERVICE, () => {
      console.log('Creating AuthValidationService');
      return new AuthValidationService();
    });

    container.registerSingleton(SERVICE_KEYS.BOOK_VALIDATION_SERVICE, () => {
      console.log('Creating BookValidationService');
      return new BookValidationService();
    });

    container.registerSingleton(SERVICE_KEYS.MEMBER_VALIDATION_SERVICE, () => {
      console.log('Creating MemberValidationService');
      return new MemberValidationService();
    });

    container.registerSingleton(SERVICE_KEYS.BORROWING_VALIDATION_SERVICE, () => {
      console.log('Creating BorrowingValidationService');
      return new BorrowingValidationService();
    });

    // Domain Services
    console.log('Registering domain services...');
    container.registerSingleton(SERVICE_KEYS.AUTHENTICATION_SERVICE, () => {
      console.log('Creating AuthenticationService');
      const authApiService = container.resolve(SERVICE_KEYS.AUTH_API_SERVICE) as AuthApiService;
      const authValidationService = container.resolve(SERVICE_KEYS.AUTH_VALIDATION_SERVICE) as AuthValidationService;
      return new AuthenticationService(authApiService, authValidationService);
    });

    container.registerSingleton(SERVICE_KEYS.BOOK_SERVICE, () => {
      console.log('Creating BookService');
      const bookRepository = container.resolve(SERVICE_KEYS.BOOK_REPOSITORY) as ApiBookRepository;
      const bookValidationService = container.resolve(SERVICE_KEYS.BOOK_VALIDATION_SERVICE) as BookValidationService;
      return new BookService(bookRepository, bookValidationService);
    });

    container.registerSingleton(SERVICE_KEYS.MEMBER_SERVICE, () => {
      console.log('Creating MemberService');
      const memberRepository = container.resolve(SERVICE_KEYS.MEMBER_REPOSITORY) as ApiMemberRepository;
      const memberValidationService = container.resolve(SERVICE_KEYS.MEMBER_VALIDATION_SERVICE) as MemberValidationService;
      return new MemberService(memberRepository, memberValidationService);
    });

    container.registerSingleton(SERVICE_KEYS.BORROWING_SERVICE, () => {
      console.log('Creating BorrowingService');
      const borrowingRepository = container.resolve(SERVICE_KEYS.BORROWING_REPOSITORY) as ApiBorrowingRepository;
      const borrowingValidationService = container.resolve(SERVICE_KEYS.BORROWING_VALIDATION_SERVICE) as BorrowingValidationService;
      return new BorrowingService(borrowingRepository, borrowingValidationService);
    });

    // Application Use Cases
    console.log('🎯 Registering use cases...');
    
    // Book Use Cases
    container.register(SERVICE_KEYS.CREATE_BOOK_USE_CASE, () => {
      console.log('Creating CreateBookUseCase');
      return new CreateBookUseCase(container.resolve(SERVICE_KEYS.BOOK_SERVICE));
    });

    container.register(SERVICE_KEYS.DELETE_BOOK_USE_CASE, () => {
      console.log('Creating DeleteBookUseCase');
      return new DeleteBookUseCase(container.resolve(SERVICE_KEYS.BOOK_SERVICE));
    });

    container.register(SERVICE_KEYS.GET_BOOKS_USE_CASE, () => {
      console.log('Creating GetBooksUseCase');
      return new GetBooksUseCase(container.resolve(SERVICE_KEYS.BOOK_SERVICE));
    });

    // Member Use Cases
    container.register(SERVICE_KEYS.GET_MEMBERS_USE_CASE, () => {
      console.log('Creating GetMembersUseCase');
      return new GetMembersUseCase(container.resolve(SERVICE_KEYS.MEMBER_SERVICE));
    });

    container.register(SERVICE_KEYS.GET_MEMBER_BY_ID_USE_CASE, () => {
      console.log('Creating GetMemberUseCase');
      return new GetMemberByIdUseCase(container.resolve(SERVICE_KEYS.MEMBER_SERVICE));
    });

    container.register(SERVICE_KEYS.REGISTER_MEMBER_USE_CASE, () => {
      console.log('Creating RegisterMemberUseCase');
      return new RegisterMemberUseCase(container.resolve(SERVICE_KEYS.MEMBER_SERVICE));
    });

    // Borrowing Use Cases
    container.register(SERVICE_KEYS.BORROW_BOOK_USE_CASE, () => {
      console.log('Creating BorrowBookUseCase');
      return new BorrowBookUseCase(container.resolve(SERVICE_KEYS.BORROWING_SERVICE));
    });

    container.register(SERVICE_KEYS.RETURN_BOOK_USE_CASE, () => {
      console.log('Creating ReturnBookUseCase');
      return new ReturnBookUseCase(container.resolve(SERVICE_KEYS.BORROWING_SERVICE));
    });

    container.register(SERVICE_KEYS.GET_MEMBER_BORROWING_STATUS_USE_CASE, () => {
      console.log('Creating GetMemberBorrowingStatusUseCase');
      return new GetMemberBorrowingStatusUseCase(container.resolve(SERVICE_KEYS.BORROWING_SERVICE));
    });

    // Application Controllers - Register as singletons to prevent re-creation
    console.log('🎮 Registering controllers...');
    container.registerSingleton(SERVICE_KEYS.BOOKS_CONTROLLER, () => {
      console.log('Creating BooksController');
      return new BooksController(
        container.resolve(SERVICE_KEYS.BOOK_SERVICE),
        container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
        container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
      );
    });

    container.registerSingleton(SERVICE_KEYS.MEMBERS_CONTROLLER, () => {
      console.log('Creating MembersController');
      return new MembersController(
        container.resolve(SERVICE_KEYS.GET_MEMBERS_USE_CASE),
        container.resolve(SERVICE_KEYS.GET_MEMBER_BY_ID_USE_CASE),
        container.resolve(SERVICE_KEYS.REGISTER_MEMBER_USE_CASE),
        container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
        container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
      );
    });

    container.registerSingleton(SERVICE_KEYS.AUTH_CONTROLLER, () => {
      console.log('Creating AuthController');
      return new AuthController(
        container.resolve(SERVICE_KEYS.AUTHENTICATION_SERVICE),
        container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
        container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
      );
    });

    container.registerSingleton(SERVICE_KEYS.BORROWING_CONTROLLER, () => {
      console.log('Creating BorrowingController');
      return new BorrowingController(
        container.resolve(SERVICE_KEYS.BORROWING_SERVICE),
        container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
        container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
      );
    });

    
    console.log('All dependencies configured successfully');
    
  } catch (error) {
    console.error('Failed to configure dependencies:', error);
    throw error;
  }
};