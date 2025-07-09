import { BorrowingService } from '../../domain/services/BorrowingService';
import { BorrowingRecord } from '../../domain/entities/BorrowingRecord';
import { BorrowingFilters, BorrowingSorting, BorrowingPagination } from '../../domain/dtos/BorrowingDto';
import { Result } from '../../shared/types/Result';
import { BusinessError } from '../../shared/types/errors';

export class GetBorrowingHistoryUseCase {
  constructor(private borrowingService: BorrowingService) {}

  async execute(
    filters?: BorrowingFilters,
    sorting?: BorrowingSorting,
    pagination?: BorrowingPagination
  ): Promise<Result<BorrowingRecord[], BusinessError>> {
    return await this.borrowingService.getAllBorrowings(filters, sorting, pagination);
  }
}