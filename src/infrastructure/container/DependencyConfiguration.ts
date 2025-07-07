import { Container } from '../../shared/container/Container';
import { SERVICE_KEYS } from '../../shared/container/ServiceKeys';

// Infrastructure
import { ApiClient } from '../api/ApiClient';
import { AuthApiService } from '../api/AuthApiService';
import { MembersApiService } from '../api/MembersApiService'; 
import { ApiBookRepository } from '../repositories/ApiBookRepository';
import { ApiMemberRepository } from '../repositories/ApiMemberRepository'; 
import { NavigationServiceImpl } from '../services/NavigationServiceImpl';
import { NotificationService } from '../services/NotificationService';

// Domain Services
import { AuthenticationService } from '../../domain/services/AuthenticationService';
import { AuthValidationService } from '../../domain/services/AuthValidationService';
import { BookService } from '../../domain/services/BookService';
import { BookValidationService } from '../../domain/services/BookValidationService';
import { MemberService } from '../../domain/services/MemberService'; 
import { MemberValidationService } from '../../domain/services/MemberValidationService'; 

// Application Controllers
import { BooksController } from '../../application/controllers/BooksController';
import { MembersController } from '../../application/controllers/MemberController'; 
import { AuthController } from '../../application/controllers/AuthController';

export const configureDependencies = (container: Container, navigate: (path: string | number) => void): void => {
  console.log('🔧 Configuring dependencies...');

  try {
    // Infrastructure layer - API and External Services
    console.log('📡 Registering infrastructure services...');
    container.registerSingleton(SERVICE_KEYS.API_CLIENT, () => {
      console.log('🌐 Creating ApiClient');
      return new ApiClient();
    });
    
    container.registerSingleton(SERVICE_KEYS.AUTH_API_SERVICE, () => {
      console.log('🔐 Creating AuthApiService');
      return new AuthApiService(container.resolve(SERVICE_KEYS.API_CLIENT));
    });

    container.registerSingleton(SERVICE_KEYS.MEMBERS_API_SERVICE, () => {
      console.log('👥 Creating MembersApiService');
      return new MembersApiService(container.resolve(SERVICE_KEYS.API_CLIENT));
    });
    
    container.registerSingleton(SERVICE_KEYS.BOOK_REPOSITORY, () => {
      console.log('📚 Creating BookRepository');
      return new ApiBookRepository(container.resolve(SERVICE_KEYS.API_CLIENT));
    });

    container.registerSingleton(SERVICE_KEYS.MEMBER_REPOSITORY, () => {
      console.log('👥 Creating MemberRepository');
      return new ApiMemberRepository(container.resolve(SERVICE_KEYS.MEMBERS_API_SERVICE));
    });

    // UI Services
    console.log('🖥️ Registering UI services...');
    container.registerSingleton(SERVICE_KEYS.NAVIGATION_SERVICE, () => {
      console.log('🧭 Creating NavigationService');
      return new NavigationServiceImpl(navigate);
    });

    container.registerSingleton(SERVICE_KEYS.NOTIFICATION_SERVICE, () => {
      console.log('🔔 Creating NotificationService');
      return new NotificationService();
    });

    // Domain Validation Services
    console.log('✅ Registering validation services...');
    container.registerSingleton(SERVICE_KEYS.AUTH_VALIDATION_SERVICE, () => {
      console.log('🔒 Creating AuthValidationService');
      return new AuthValidationService();
    });

    container.registerSingleton(SERVICE_KEYS.BOOK_VALIDATION_SERVICE, () => {
      console.log('📖 Creating BookValidationService');
      return new BookValidationService();
    });

    container.registerSingleton(SERVICE_KEYS.MEMBER_VALIDATION_SERVICE, () => {
      console.log('👥 Creating MemberValidationService');
      return new MemberValidationService();
    });

    // Domain Services
    console.log('🏗️ Registering domain services...');
    container.registerSingleton(SERVICE_KEYS.AUTHENTICATION_SERVICE, () => {
      console.log('👤 Creating AuthenticationService');
      const authApiService = container.resolve(SERVICE_KEYS.AUTH_API_SERVICE) as AuthApiService;
      const authValidationService = container.resolve(SERVICE_KEYS.AUTH_VALIDATION_SERVICE) as AuthValidationService;
      return new AuthenticationService(authApiService, authValidationService);
    });

    container.registerSingleton(SERVICE_KEYS.BOOK_SERVICE, () => {
      console.log('📚 Creating BookService');
      const bookRepository = container.resolve(SERVICE_KEYS.BOOK_REPOSITORY) as ApiBookRepository;
      const bookValidationService = container.resolve(SERVICE_KEYS.BOOK_VALIDATION_SERVICE) as BookValidationService;
      return new BookService(bookRepository, bookValidationService);
    });

    container.registerSingleton(SERVICE_KEYS.MEMBER_SERVICE, () => {
      console.log('👥 Creating MemberService');
      const memberRepository = container.resolve(SERVICE_KEYS.MEMBER_REPOSITORY) as ApiMemberRepository;
      const memberValidationService = container.resolve(SERVICE_KEYS.MEMBER_VALIDATION_SERVICE) as MemberValidationService;
      return new MemberService(memberRepository, memberValidationService);
    });

    // Application Controllers
    console.log('🎮 Registering controllers...');
    container.register(SERVICE_KEYS.BOOKS_CONTROLLER, () => {
      console.log('📚 Creating BooksController');
      return new BooksController(
        container.resolve(SERVICE_KEYS.BOOK_SERVICE),
        container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
        container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
      );
    });

    container.register(SERVICE_KEYS.MEMBERS_CONTROLLER, () => {
      console.log('👥 Creating MembersController');
      return new MembersController(
        container.resolve(SERVICE_KEYS.MEMBER_SERVICE),
        container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
        container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
      );
    });

    container.register(SERVICE_KEYS.AUTH_CONTROLLER, () => {
      console.log('🔐 Creating AuthController');
      return new AuthController(
        container.resolve(SERVICE_KEYS.AUTHENTICATION_SERVICE),
        container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
        container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
      );
    });

    console.log('✅ All dependencies configured successfully');
    
    // Log all registered services for debugging
    const registeredServices = [
      SERVICE_KEYS.API_CLIENT,
      SERVICE_KEYS.AUTH_API_SERVICE,
      SERVICE_KEYS.MEMBERS_API_SERVICE,
      SERVICE_KEYS.BOOK_REPOSITORY,
      SERVICE_KEYS.MEMBER_REPOSITORY,
      SERVICE_KEYS.NAVIGATION_SERVICE,
      SERVICE_KEYS.NOTIFICATION_SERVICE,
      SERVICE_KEYS.AUTH_VALIDATION_SERVICE,
      SERVICE_KEYS.BOOK_VALIDATION_SERVICE,
      SERVICE_KEYS.MEMBER_VALIDATION_SERVICE,
      SERVICE_KEYS.AUTHENTICATION_SERVICE,
      SERVICE_KEYS.BOOK_SERVICE,
      SERVICE_KEYS.MEMBER_SERVICE,
      SERVICE_KEYS.BOOKS_CONTROLLER,
      SERVICE_KEYS.MEMBERS_CONTROLLER,
      SERVICE_KEYS.AUTH_CONTROLLER
    ];
    
    console.log('📋 Registered services:', registeredServices);

  } catch (error) {
    console.error('❌ Failed to configure dependencies:', error);
    throw error;
  }
};