import { BorrowingService } from '../../domain/services/BorrowingService';
import { BorrowingRecord } from '../../domain/entities/BorrowingRecord';
import { BorrowBookDto } from '../../domain/dtos/BorrowingDto';
import { Result } from '../../shared/types/Result';
import { BusinessError } from '../../shared/types/errors';

export class BorrowBookUseCase {
  constructor(private borrowingService: BorrowingService) {}

  async execute(data: BorrowBookDto): Promise<Result<BorrowingRecord, BusinessError>> {
    return await this.borrowingService.borrowBook(data);
  }
}