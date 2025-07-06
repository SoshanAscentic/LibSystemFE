import { Container } from '../../shared/container/Container';
import { SERVICE_KEYS } from '../../shared/container/ServiceKeys';

// Infrastructure
import { ApiClient } from '../api/ApiClient';
import { AuthApiService } from '../api/AuthApiService';
import { ApiBookRepository } from '../repositories/ApiBookRepository';
import { NavigationServiceImpl } from '../services/NavigationServiceImpl';
import { NotificationService } from '../services/NotificationService';

// Domain Services
import { AuthenticationService } from '../../domain/services/AuthenticationService';
import { AuthValidationService } from '../../domain/services/AuthValidationService';
import { BookService } from '../../domain/services/BookService';
import { BookValidationService } from '../../domain/services/BookValidationService';

// Application Controllers
import { BooksController } from '../../application/controllers/BooksController';
import { AuthController } from '../../application/controllers/AuthController';

export const configureDependencies = (container: Container, navigate: (path: string | number) => void): void => {
  // Infrastructure layer - API and External Services
  container.registerSingleton(SERVICE_KEYS.API_CLIENT, () => new ApiClient());
  
  container.registerSingleton(SERVICE_KEYS.AUTH_API_SERVICE, () => 
    new AuthApiService(container.resolve(SERVICE_KEYS.API_CLIENT))
  );
  
  container.registerSingleton(SERVICE_KEYS.BOOK_REPOSITORY, () => 
    new ApiBookRepository(container.resolve(SERVICE_KEYS.API_CLIENT))
  );

  // UI Services
  container.registerSingleton(SERVICE_KEYS.NAVIGATION_SERVICE, () => 
    new NavigationServiceImpl(navigate)
  );

  container.registerSingleton(SERVICE_KEYS.NOTIFICATION_SERVICE, () => 
    new NotificationService()
  );

  // Domain Validation Services
  container.registerSingleton(SERVICE_KEYS.AUTH_VALIDATION_SERVICE, () => 
    new AuthValidationService()
  );

  container.registerSingleton(SERVICE_KEYS.BOOK_VALIDATION_SERVICE, () => 
    new BookValidationService()
  );

  // Domain Services
  container.registerSingleton(SERVICE_KEYS.AUTHENTICATION_SERVICE, () => 
    new AuthenticationService(
      container.resolve(SERVICE_KEYS.AUTH_API_SERVICE),
      container.resolve(SERVICE_KEYS.AUTH_VALIDATION_SERVICE)
    )
  );

  container.registerSingleton(SERVICE_KEYS.BOOK_SERVICE, () => 
    new BookService(
      container.resolve(SERVICE_KEYS.BOOK_REPOSITORY),
      container.resolve(SERVICE_KEYS.BOOK_VALIDATION_SERVICE)
    )
  );

  // Application Controllers
  container.register(SERVICE_KEYS.BOOKS_CONTROLLER, () => 
    new BooksController(
      container.resolve(SERVICE_KEYS.BOOK_SERVICE),
      container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
      container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
    )
  );

  container.register(SERVICE_KEYS.AUTH_CONTROLLER, () => 
    new AuthController(
      container.resolve(SERVICE_KEYS.AUTHENTICATION_SERVICE),
      container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
      container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
    )
  );
};