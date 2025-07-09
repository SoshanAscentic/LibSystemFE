import { Result } from '../../shared/types/Result';
import { Book, BookCategory } from '../entities/Book';
import { CreateBookDto, UpdateBookDto } from '../dtos/CreateBookDto';
import { BookFilters, BookSorting, BookPagination } from '../valueObjects/BookFilters';

export interface IBookRepository {
  findAll(
    filters?: BookFilters,
    sorting?: BookSorting,
    pagination?: BookPagination
  ): Promise<Result<Book[], Error>>;
  
  findById(id: number): Promise<Result<Book | null, Error>>;

  create(data: CreateBookDto): Promise<Result<Book, Error>>;
    
  delete(id: number): Promise<Result<void, Error>>;
  
  findByCategory(category: BookCategory): Promise<Result<Book[], Error>>;
  
  findByAuthor(author: string): Promise<Result<Book[], Error>>;
}