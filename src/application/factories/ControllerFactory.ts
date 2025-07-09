import { Container } from '../../shared/container/Container';
import { SERVICE_KEYS } from '../../shared/container/ServiceKeys';
import { BooksController } from '../controllers/BooksController';
import { MembersController } from '../controllers/MemberController';
import { AuthController } from '../controllers/AuthController';

export class ControllerFactory {
  constructor(private container: Container) {}

  createBooksController(): BooksController {
    return this.container.resolve<BooksController>(SERVICE_KEYS.BOOKS_CONTROLLER);
  }

  createMembersController(): MembersController {
    return this.container.resolve<MembersController>(SERVICE_KEYS.MEMBERS_CONTROLLER);
  }

  createAuthController(): AuthController {
    return this.container.resolve<AuthController>(SERVICE_KEYS.AUTH_CONTROLLER);
  }
}