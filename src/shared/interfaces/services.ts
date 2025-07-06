export interface INavigationService {
  navigateToBook(id: number): void;
  navigateToBooks(): void;
  navigateToDashboard(): void;
  navigateToLogin(): void;
  navigateToRegister(): void;
  goBack(): void;
}

export interface INotificationService {
  showSuccess(message: string, description?: string): void;
  showError(message: string, description?: string): void;
  showInfo(message: string, description?: string): void;
  showWarning(message: string, description?: string): void;
}