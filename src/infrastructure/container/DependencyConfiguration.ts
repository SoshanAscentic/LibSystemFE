import { Container } from '../../shared/container/Container';
import { SERVICE_KEYS } from '../../shared/container/ServiceKeys';
import { ApiClient } from '../api/ApiClient';
import { ApiBookRepository } from '../repositories/ApiBookRepository';
import { NavigationServiceImpl } from '../services/NavigationServiceImpl';
import { NotificationService } from '../services/NotificationService';
import { BookService } from '../../domain/services/BookService';
import { BookValidationService } from '../../domain/services/BookValidationService';

export const configureDependencies = (container: Container, navigate: (path: string | number) => void): void => {
  // Infrastructure layer
  container.registerSingleton(SERVICE_KEYS.API_CLIENT, () => new ApiClient());
  
  container.registerSingleton(SERVICE_KEYS.BOOK_REPOSITORY, () => 
    new ApiBookRepository(container.resolve(SERVICE_KEYS.API_CLIENT))
  );

  container.registerSingleton(SERVICE_KEYS.NAVIGATION_SERVICE, () => 
    new NavigationServiceImpl(navigate)
  );

  container.registerSingleton(SERVICE_KEYS.NOTIFICATION_SERVICE, () => 
    new NotificationService()
  );

  // Domain services
  container.registerSingleton('BookValidationService', () => 
    new BookValidationService()
  );

  container.registerSingleton(SERVICE_KEYS.BOOK_SERVICE, () => 
    new BookService(
      container.resolve(SERVICE_KEYS.BOOK_REPOSITORY),
      container.resolve('BookValidationService')
    )
  );

  // Application controllers will be created on-demand
  container.register(SERVICE_KEYS.BOOKS_CONTROLLER, () => 
    new (require('../../application/controllers/BooksController').BooksController)(
      container.resolve(SERVICE_KEYS.BOOK_SERVICE),
      container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
      container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
    )
  );
};