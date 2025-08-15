import { IBookRepository } from '../../domain/repositories/IBookRepository';
import { Book, BookCategory } from '../../domain/entities/Book';
import { CreateBookDto, UpdateBookDto } from '../../domain/dtos/CreateBookDto';
import { BookFilters, BookSorting, BookPagination } from '../../domain/valueObjects/BookFilters';
import { Result } from '../../shared/types/Result';
import { ApiClient } from '../api/ApiClient';

export class ApiBookRepository implements IBookRepository {
  constructor(private apiClient: ApiClient) {}

  async findAll(
    filters?: BookFilters,
    sorting?: BookSorting,
    pagination?: BookPagination
  ): Promise<Result<Book[], Error>> {
    try {
      let response;

      // If category filter is specified, use category endpoint
      if (filters?.category) {
        response = await this.apiClient.get<Book[]>(`/api/books/category/${filters.category}`);
      }
      // If author filter is specified, use author endpoint
      else if (filters?.author) {
        response = await this.apiClient.get<Book[]>(`/api/books/author/${encodeURIComponent(filters.author)}`);
      }
      // Otherwise get all books
      else {
        const params = {
          ...sorting,
          ...pagination
        };
        response = await this.apiClient.get<Book[]>('/api/books', { params });
      }
      
      if (response.data.success) {
        let books = response.data.data.map(this.mapToBook);
        
        // Apply client-side filtering if we got all books but have filters
        if (!filters?.category && !filters?.author) {
          // No server-side filtering was applied, return all books
        } else if (filters?.category && filters?.author) {
          // If both filters are applied, we need to get all books and filter client-side
          // since we can only use one endpoint at a time
          const allBooksResponse = await this.apiClient.get<Book[]>('/api/books');
          if (allBooksResponse.data.success) {
            books = allBooksResponse.data.data.map(this.mapToBook)
              .filter(book => 
                book.category === filters.category && 
                book.author.toLowerCase().includes(filters.author!.toLowerCase())
              );
          }
        }
        
        return Result.success(books);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch books'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while fetching books'));
    }
  }

  async findById(id: number): Promise<Result<Book | null, Error>> {
    try {
      const response = await this.apiClient.get<Book>(`/api/books/${id}`);
      
      if (response.data.success) {
        const book = this.mapToBook(response.data.data);
        return Result.success(book);
      } else {
        if (response.data.error?.code === 'NOT_FOUND') {
          return Result.success(null);
        }
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch book'));
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return Result.success(null);
      }
      return Result.failure(new Error(error.message || 'Network error while fetching book'));
    }
  }

  // Remove search method since we're removing search functionality

  async create(data: CreateBookDto): Promise<Result<Book, Error>> {
    try {
      const response = await this.apiClient.post<Book>('/api/books', data);
      
      if (response.data.success) {
        const book = this.mapToBook(response.data.data);
        return Result.success(book);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to create book'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while creating book'));
    }
  }

  
  async delete(id: number): Promise<Result<void, Error>> {
    try {
      console.log('ApiBookRepository: Making DELETE request for book ID:', id);
      
      const response = await this.apiClient.delete<void>(`/api/books/${id}`);
      console.log('ApiBookRepository: DELETE response:', response.data);
      
      if (response.data.success) {
        console.log('ApiBookRepository: Delete successful');
        return Result.success(undefined);
      } else {
        console.error('ApiBookRepository: API returned success: false');
        const errorMessage = response.data.error?.message || 'Delete operation failed';
        console.error('ApiBookRepository: Error message:', errorMessage);
        return Result.failure(new Error(errorMessage));
      }
    } catch (error: any) {
      console.error('ApiBookRepository: DELETE request failed:', error);
      
      if (error.response) {
        const status = error.response.status;
        console.log('ApiBookRepository: HTTP status:', status);
        console.log('ApiBookRepository: Response data:', error.response.data);
        
        switch (status) {
          case 404:
            console.warn('ApiBookRepository: Book not found (404) - might already be deleted');
            return Result.success(undefined);
            
          case 400:
            const badRequestMessage = error.response.data?.error?.message || 
                                    error.response.data?.message || 
                                    'Bad request';
            return Result.failure(new Error(badRequestMessage));
            
          case 403:
            return Result.failure(new Error('Access denied - insufficient permissions'));
            
          case 409:
            return Result.failure(new Error('Cannot delete book - it may be borrowed or have dependencies'));
            
          case 500:
            return Result.failure(new Error('Server error occurred while deleting book'));
            
          default:
            return Result.failure(new Error(`HTTP ${status}: ${error.response.data?.message || 'Delete failed'}`));
        }
      } else if (error.request) {
        console.error('ApiBookRepository: Network error - no response received');
        return Result.failure(new Error('Network error - could not reach server'));
      } else {
        console.error('ApiBookRepository: Request setup error:', error.message);
        return Result.failure(new Error(`Request error: ${error.message}`));
      }
    }
  }

  async findByCategory(category: BookCategory): Promise<Result<Book[], Error>> {
    try {
      const response = await this.apiClient.get<Book[]>(`/api/books/category/${category}`);
      
      if (response.data.success) {
        const books = response.data.data.map(this.mapToBook);
        return Result.success(books);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch books by category'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while fetching books by category'));
    }
  }

  async findByAuthor(author: string): Promise<Result<Book[], Error>> {
    try {
      const response = await this.apiClient.get<Book[]>(`/api/books/author/${encodeURIComponent(author)}`);
      
      if (response.data.success) {
        const books = response.data.data.map(this.mapToBook);
        return Result.success(books);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch books by author'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while fetching books by author'));
    }
  }

  private mapToBook(dto: any): Book {
    return {
      bookId: dto.bookId,
      title: dto.title,
      author: dto.author,
      publicationYear: dto.publicationYear,
      category: dto.category as BookCategory,
      isAvailable: dto.isAvailable
    };
  }
}