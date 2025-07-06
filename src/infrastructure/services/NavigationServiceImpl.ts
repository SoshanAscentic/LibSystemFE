import { INavigationService } from '../../shared/interfaces/services';

export class NavigationServiceImpl implements INavigationService {
  private navigate: (path: string | number) => void;

  constructor(navigate: (path: string | number) => void) {
    this.navigate = navigate;
  }

  navigateToBook(id: number): void {
    this.navigate(`/books/${id}`);
  }

  navigateToBooks(): void {
    this.navigate('/books');
  }

  navigateToDashboard(): void {
    this.navigate('/dashboard');
  }

  goBack(): void {
    this.navigate(-1);
  }
}
