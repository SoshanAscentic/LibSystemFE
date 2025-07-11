import { IBorrowingRepository } from '../../domain/repositories/IBorrowingRepository';
import { BorrowingRecord, MemberBorrowingStatus } from '../../domain/entities/BorrowingRecord';
import { BorrowBookDto, ReturnBookDto, BorrowingFilters, BorrowingSorting, BorrowingPagination } from '../../domain/dtos/BorrowingDto';
import { Result } from '../../shared/types/Result';
import { BorrowingApiService } from '../api/BorrowingApiService';

export class ApiBorrowingRepository implements IBorrowingRepository {
  constructor(private borrowingApiService: BorrowingApiService) {}

  async borrowBook(data: BorrowBookDto): Promise<Result<BorrowingRecord, Error>> {
    try {
      return await this.borrowingApiService.borrowBook(data);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while borrowing book'));
    }
  }

  async returnBook(data: ReturnBookDto): Promise<Result<BorrowingRecord, Error>> {
    try {
      return await this.borrowingApiService.returnBook(data);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while returning book'));
    }
  }

  async findAll(
    filters?: BorrowingFilters,
    sorting?: BorrowingSorting,
    pagination?: BorrowingPagination
  ): Promise<Result<BorrowingRecord[], Error>> {
    try {
      return await this.borrowingApiService.getAllBorrowings(filters, sorting, pagination);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while fetching borrowing records'));
    }
  }

  async findById(id: number): Promise<Result<BorrowingRecord | null, Error>> {
    try {
      return await this.borrowingApiService.getBorrowingById(id);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while fetching borrowing record'));
    }
  }

  async findByMember(memberId: number): Promise<Result<MemberBorrowingStatus, Error>> {
    try {
      return await this.borrowingApiService.getMemberBorrowingStatus(memberId);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while fetching member borrowing status'));
    }
  }
}