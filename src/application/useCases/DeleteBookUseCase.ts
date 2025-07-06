import { BookService } from '../../domain/services/BookService';
import { Result } from '../../shared/types/Result';
import { BusinessError } from '../../shared/types/errors';

export class DeleteBookUseCase {
  constructor(private bookService: BookService) {}

  async execute(bookId: number): Promise<Result<void, BusinessError>> {
    return await this.bookService.deleteBook(bookId);
  }
}