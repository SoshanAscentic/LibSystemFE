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
      const params = {
        ...filters,
        ...sorting,
        ...pagination
      };

      const response = await this.apiClient.get<Book[]>('/api/books', { params });
      
      if (response.data.success) {
        const books = response.data.data.map(this.mapToBook);
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

  async search(query: string, filters?: BookFilters): Promise<Result<Book[], Error>> {
    try {
      const params = {
        search: query,
        ...filters
      };

      const response = await this.apiClient.get<Book[]>('/api/books', { params });
      
      if (response.data.success) {
        const books = response.data.data.map(this.mapToBook);
        return Result.success(books);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to search books'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while searching books'));
    }
  }

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

  async update(id: number, data: UpdateBookDto): Promise<Result<Book, Error>> {
    try {
      const response = await this.apiClient.put<Book>(`/api/books/${id}`, data);
      
      if (response.data.success) {
        const book = this.mapToBook(response.data.data);
        return Result.success(book);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to update book'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while updating book'));
    }
  }

  async delete(id: number): Promise<Result<void, Error>> {
    try {
      const response = await this.apiClient.delete<void>(`/api/books/${id}`);
      
      if (response.data.success) {
        return Result.success(undefined);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to delete book'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while deleting book'));
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