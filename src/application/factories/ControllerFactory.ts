import { Container } from '../../shared/container/Container';
import { SERVICE_KEYS } from '../../shared/container/ServiceKeys';
import { BooksController } from '../controllers/BooksController';
import { AuthController } from '../controllers/AuthController';

export class ControllerFactory {
  constructor(private container: Container) {}

  createBooksController(): BooksController {
    return new BooksController(
      this.container.resolve(SERVICE_KEYS.BOOK_SERVICE),
      this.container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
      this.container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
    );
  }

  createAuthController(): AuthController {
    return new AuthController(
      this.container.resolve(SERVICE_KEYS.NAVIGATION_SERVICE),
      this.container.resolve(SERVICE_KEYS.NOTIFICATION_SERVICE)
    );
  }
}