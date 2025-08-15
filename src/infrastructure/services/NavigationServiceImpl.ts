import { INavigationService } from '../../shared/interfaces/services';

export class NavigationServiceImpl implements INavigationService {
  private navigate: (path: string | number, options?: { state?: any }) => void;

  constructor(navigate: (path: string | number, options?: { state?: any }) => void) {
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

  // Updated to support pre-selecting a book
  navigateToBorrowBook(bookId?: number): void {
    if (bookId) {
      this.navigate('/borrowing/borrow', { state: { preSelectedBookId: bookId } });
    } else {
      this.navigate('/borrowing/borrow');
    }
  }

  navigateToReturnBook(): void {
    this.navigate('/borrowing/return');
  }

  goBack(): void {
    this.navigate(-1);
  }
}