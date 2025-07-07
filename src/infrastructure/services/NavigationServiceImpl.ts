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

  navigateToMember(id: number): void {
    this.navigate(`/members/${id}`);
  }

  navigateToMembers(): void {
    this.navigate('/members');
  }

  navigateToDashboard(): void {
    this.navigate('/dashboard');
  }

  navigateToLogin(): void {
    this.navigate('/login');
  }

  navigateToRegister(): void {
    this.navigate('/register');
  }

  goBack(): void {
    this.navigate(-1);
  }
}