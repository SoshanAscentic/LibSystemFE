export { BooksPage } from './BooksPage';
export { BookDetailsPage } from './BookDetailsPage';
export { CreateBookPage } from './CreateBookPage';
export { EditBookPage } from './EditBookPage';

// Mock user permissions hook (replace with actual implementation)
const useUserPermissions = () => ({
  canEdit: true,
  canDelete: true,
  canBorrow: true,
  canAdd: true
});