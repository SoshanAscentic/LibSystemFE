import { useNavigate } from 'react-router-dom';
import { INavigationService } from '../../shared/interfaces/services';

export class NavigationService implements INavigationService {
  constructor(private navigate: ReturnType<typeof useNavigate>) {}

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
