import { Result } from '../../../shared/types/Result';
import { BusinessError, ValidationError } from '../../../shared/types/errors';
import { Book } from '../../entities/Book';
import { CreateBookDto, UpdateBookDto } from '../../dtos/CreateBookDto';
import { BookFilters, BookSorting, BookPagination } from '../../valueObjects/BookFilters';
import { IBookRepository } from '../../repositories/IBookRepository';
import { BookValidationService } from './BookValidationService';

export class BookService {
  constructor(
    private repository: IBookRepository,
    private validationService: BookValidationService
  ) {}

  async getAllBooks(
    filters?: BookFilters,
    sorting?: BookSorting,
    pagination?: BookPagination
  ): Promise<Result<Book[], BusinessError>> {
    try {
      const result = await this.repository.findAll(filters, sorting, pagination);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to retrieve books', 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while fetching books', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async getBookById(id: number): Promise<Result<Book | null, BusinessError>> {
    if (!id || id <= 0) {
      return Result.failure(
        new ValidationError('Book ID must be a positive number', 'id', id)
      );
    }

    try {
      const result = await this.repository.findById(id);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError(`Failed to retrieve book with ID ${id}`, 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while fetching book', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async createBook(data: CreateBookDto): Promise<Result<Book, BusinessError>> {
    // Validate input
    const validation = this.validationService.validateCreateBook(data);
    if (!validation.isValid) {
      return Result.failure(
        new ValidationError(validation.errors.join(', '), 'book_data', data)
      );
    }

    try {
      // Business rule: Check for duplicate titles by same author
      const existingBooksResult = await this.repository.findByAuthor(data.author);
      if (existingBooksResult.isSuccess) {
        const duplicateTitle = existingBooksResult.value.find(
          book => book.title.toLowerCase() === data.title.toLowerCase()
        );
        
        if (duplicateTitle) {
          return Result.failure(
            new BusinessError(
              `A book with title "${data.title}" by ${data.author} already exists`,
              'DUPLICATE_BOOK'
            )
          );
        }
      }

      const result = await this.repository.create(data);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to create book', 'CREATE_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while creating book', 'UNKNOWN_ERROR', error)
      );
    }
  }
  async deleteBook(id: number): Promise<Result<void, BusinessError>> {
  console.log('BookService: Starting delete for book ID:', id);
  
  if (!id || id <= 0) {
    console.log('BookService: Invalid book ID');
    return Result.failure(
      new ValidationError('Book ID must be a positive number', 'id', id)
    );
  }

  try {
    // Check if book exists
    console.log('BookService: Checking if book exists...');
    const existingBookResult = await this.repository.findById(id);
    console.log('BookService: Book exists check result:', existingBookResult);
    
    if (existingBookResult.isFailure) {
      console.log('BookService: Failed to check if book exists');
      return Result.failure(
        new BusinessError(`Failed to verify book with ID ${id}`, 'VERIFICATION_ERROR', existingBookResult.error)
      );
    }
    
    if (!existingBookResult.value) {
      console.log('BookService: Book not found');
      return Result.failure(
        new BusinessError(`Book with ID ${id} not found`, 'NOT_FOUND')
      );
    }

    // Business rule: Cannot delete borrowed books
    const book = existingBookResult.value;
    console.log('BookService: Book availability:', book.isAvailable);
    
    if (!book.isAvailable) {
      console.log('BookService: Cannot delete borrowed book');
      return Result.failure(
        new BusinessError(
          'Cannot delete a book that is currently borrowed',
          'BOOK_BORROWED'
        )
      );
    }

    console.log('BookService: Calling repository delete...');
    const result = await this.repository.delete(id);
    console.log('BookService: Repository delete result:', result);
    
    if (result.isFailure) {
      console.error('BookService: Repository delete failed:', result.error);
      return Result.failure(
        new BusinessError('Failed to delete book', 'DELETE_ERROR', result.error)
      );
    }

    console.log('BookService: Delete successful');
    return Result.success(undefined);
  } catch (error) {
    console.error('BookService: Unexpected error during delete:', error);
    return Result.failure(
      new BusinessError('Unexpected error while deleting book', 'UNKNOWN_ERROR', error)
    );
  }
}
}