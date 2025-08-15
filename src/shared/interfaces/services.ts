export interface INavigationService {
  [x: string]: any;
  navigateToBook(id: number): void;
  navigateToBooks(): void;
  navigateToMember(id: number): void; 
  navigateToMembers(): void; 
  navigateToDashboard(): void;
  navigateToLogin(): void;
  navigateToRegister(): void;
  
  navigateToBorrowBook(bookId?: number): void; 
  navigateToReturnBook(): void;
  
  goBack(): void;
}

export interface INotificationService {
  showSuccess(message: string, description?: string): void;
  showError(message: string, description?: string): void;
  showInfo(message: string, description?: string): void;
  showWarning(message: string, description?: string): void;
}