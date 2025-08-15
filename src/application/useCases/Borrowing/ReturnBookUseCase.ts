import { BorrowingService } from '../../../domain/services/Borrowing/BorrowingService';
import { BorrowingRecord } from '../../../domain/entities/BorrowingRecord';
import { ReturnBookDto } from '../../../domain/dtos/BorrowingDto';
import { Result } from '../../../shared/types/Result';
import { BusinessError } from '../../../shared/types/errors';

export class ReturnBookUseCase {
  constructor(private borrowingService: BorrowingService) {}

  async execute(data: ReturnBookDto): Promise<Result<BorrowingRecord, BusinessError>> {
    return await this.borrowingService.returnBook(data);
  }
}