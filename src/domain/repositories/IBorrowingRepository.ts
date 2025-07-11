import { Result } from '../../shared/types/Result';
import { BorrowingRecord, MemberBorrowingStatus, BorrowingStatistics } from '../entities/BorrowingRecord';
import { BorrowBookDto, ReturnBookDto, BorrowingFilters, BorrowingSorting, BorrowingPagination } from '../dtos/BorrowingDto';

export interface IBorrowingRepository {
  borrowBook(data: BorrowBookDto): Promise<Result<BorrowingRecord, Error>>;
  returnBook(data: ReturnBookDto): Promise<Result<BorrowingRecord, Error>>;
  findAll(
    filters?: BorrowingFilters,
    sorting?: BorrowingSorting,
    pagination?: BorrowingPagination
  ): Promise<Result<BorrowingRecord[], Error>>;
  findById(id: number): Promise<Result<BorrowingRecord | null, Error>>;
  findByMember(memberId: number): Promise<Result<MemberBorrowingStatus, Error>>;
}