import { BookService } from '../../domain/services/BookService';
import { Book } from '../../domain/entities/Book';
import { CreateBookDto } from '../../domain/dtos/CreateBookDto';
import { Result } from '../../shared/types/Result';
import { BusinessError } from '../../shared/types/errors';

export class CreateBookUseCase {
  constructor(private bookService: BookService) {}

  async execute(data: CreateBookDto): Promise<Result<Book, BusinessError>> {
    return await this.bookService.createBook(data);
  }
}