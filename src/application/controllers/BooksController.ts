import { ControllerResult } from '../../shared/interfaces/common';
import { INavigationService, INotificationService } from '../../shared/interfaces/services';
import { BookService } from '../../domain/services/BookService';
import { Book } from '../../domain/entities/Book';
import { CreateBookDto, UpdateBookDto } from '../../domain/dtos/CreateBookDto';
import { BookFilters, BookSorting, BookPagination } from '../../domain/valueObjects/BookFilters';

export class BooksController {
  constructor(
    private bookService: BookService,
    private navigationService: INavigationService,
    private notificationService: INotificationService
  ) {}

  async handleGetAllBooks(
    filters?: BookFilters,
    sorting?: BookSorting,
    pagination?: BookPagination
  ): Promise<{ books: Book[]; success: boolean; error?: string }> {
    const result = await this.bookService.getAllBooks(filters, sorting, pagination);

    if (result.isSuccess) {
      return {
        books: result.value,
        success: true
      };
    } else {
      this.notificationService.showError(
        'Failed to load books',
        result.error.message
      );
      return {
        books: [],
        success: false,
        error: result.error.message
      };
    }
  }

  async handleGetBookById(id: number): Promise<{ book: Book | null; success: boolean; error?: string }> {
    const result = await this.bookService.getBookById(id);

    if (result.isSuccess) {
      return {
        book: result.value,
        success: true
      };
    } else {
      this.notificationService.showError(
        'Failed to load book',
        result.error.message
      );
      return {
        book: null,
        success: false,
        error: result.error.message
      };
    }
  }

  async handleCreateBook(data: CreateBookDto): Promise<ControllerResult> {
    const result = await this.bookService.createBook(data);

    if (result.isSuccess) {
      this.notificationService.showSuccess(
        'Book created successfully',
        `"${result.value.title}" has been added to the library`
      );
      
      // Navigate to the new book's detail page
      this.navigationService.navigateToBook(result.value.bookId);
      
      return ControllerResult.success(result.value);
    } else {
      this.notificationService.showError(
        'Failed to create book',
        result.error.message
      );
      
      return ControllerResult.failure(result.error.message);
    }
  }

  async handleUpdateBook(id: number, data: UpdateBookDto): Promise<ControllerResult> {
    const result = await this.bookService.updateBook(id, data);

    if (result.isSuccess) {
      this.notificationService.showSuccess(
        'Book updated successfully',
        `"${result.value.title}" has been updated`
      );
      
      return ControllerResult.success(result.value);
    } else {
      this.notificationService.showError(
        'Failed to update book',
        result.error.message
      );
      
      return ControllerResult.failure(result.error.message);
    }
  }

  async handleDeleteBook(book: Book): Promise<ControllerResult> {
  try {
    console.log('🗑️ BooksController: Starting delete for book:', book.bookId, book.title);
    
    const result = await this.bookService.deleteBook(book.bookId);
    console.log('🗑️ BooksController: Service result:', result);

    if (result.isSuccess) {
      console.log('🗑️ BooksController: Delete successful');
      this.notificationService.showSuccess(
        'Book deleted successfully',
        `"${book.title}" has been removed from the library`
      );
      
      return ControllerResult.success();
    } else {
      console.error('🗑️ BooksController: Delete failed:', result.error);
      
      // 🔧 Check if it's a "not found" error (which might happen if book was already deleted)
      if (result.error.message && result.error.message.includes('not found')) {
        console.warn('🗑️ BooksController: Book not found, treating as success (already deleted)');
        this.notificationService.showSuccess(
          'Book deleted successfully',
          `"${book.title}" has been removed from the library`
        );
        return ControllerResult.success();
      }
      
      // For other errors, show the actual error
      this.notificationService.showError(
        'Failed to delete book',
        result.error.message || 'An error occurred while deleting the book'
      );
      
      return ControllerResult.failure(result.error.message || 'Delete failed');
    }
  } catch (error: any) {
    console.error('🗑️ BooksController: Unexpected error:', error);
    
    const errorMessage = 'An unexpected error occurred. Please try again.';
    this.notificationService.showError(
      'Failed to delete book',
      errorMessage
    );
    
    return ControllerResult.failure(errorMessage);
  }
}

  async handleSearchBooks(query: string, filters?: BookFilters): Promise<{ books: Book[]; success: boolean; error?: string }> {
    const result = await this.bookService.searchBooks(query, filters);

    if (result.isSuccess) {
      return {
        books: result.value,
        success: true
      };
    } else {
      // For search errors, we might not want to show notifications
      // as they can be noisy while user is typing
      return {
        books: [],
        success: false,
        error: result.error.message
      };
    }
  }

  // Navigation helpers
  handleViewBook(book: Book): void {
    this.navigationService.navigateToBook(book.bookId);
  }

  handleNavigateToAddBook(): void {
    this.navigationService.navigateToBooks();
    // The specific routing to /books/add will be handled by the navigation service
  }

  handleNavigateToBooks(): void {
    this.navigationService.navigateToBooks();
  }

  handleNavigateBack(): void {
    this.navigationService.goBack();
  }
}
