import { BookService } from '../../domain/services/BookService';
import { Book } from '../../domain/entities/Book';
import { BookFilters } from '../../domain/valueObjects/BookFilters';
import { Result } from '../../shared/types/Result';
import { BusinessError } from '../../shared/types/errors';

export class SearchBooksUseCase {
  constructor(private bookService: BookService) {}

  async execute(query: string, filters?: BookFilters): Promise<Result<Book[], BusinessError>> {
    return await this.bookService.searchBooks(query, filters);
  }
}