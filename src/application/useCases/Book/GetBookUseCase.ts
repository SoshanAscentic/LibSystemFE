import { BookService } from '../../domain/services/BookService';
import { Book } from '../../domain/entities/Book';
import { BookFilters, BookSorting, BookPagination } from '../../domain/valueObjects/BookFilters';
import { Result } from '../../shared/types/Result';
import { BusinessError } from '../../shared/types/errors';

export class GetBooksUseCase {
  constructor(private bookService: BookService) {}

  async execute(
    filters?: BookFilters,
    sorting?: BookSorting,
    pagination?: BookPagination
  ): Promise<Result<Book[], BusinessError>> {
    return await this.bookService.getAllBooks(filters, sorting, pagination);
  }
}