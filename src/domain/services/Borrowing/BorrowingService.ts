import { Result } from '../../../shared/types/Result';
import { BusinessError, ValidationError } from '../../../shared/types/errors';
import { BorrowingRecord, MemberBorrowingStatus, BorrowingStatistics } from '../../entities/BorrowingRecord';
import { BorrowBookDto, ReturnBookDto, BorrowingFilters, BorrowingSorting, BorrowingPagination } from '../../dtos/BorrowingDto';
import { IBorrowingRepository } from '../../repositories/IBorrowingRepository';
import { BorrowingValidationService } from './BorrowingValidationService';

export class BorrowingService {
  constructor(
    private repository: IBorrowingRepository,
    private validationService: BorrowingValidationService
  ) {}

  async borrowBook(data: BorrowBookDto): Promise<Result<BorrowingRecord, BusinessError>> {
    // Validate input
    const validation = this.validationService.validateBorrowBook(data);
    if (!validation.isValid) {
      return Result.failure(
        new ValidationError(validation.errors.join(', '), 'borrow_data', data)
      );
    }

    try {
      const result = await this.repository.borrowBook(data);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to borrow book', 'BORROW_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while borrowing book', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async returnBook(data: ReturnBookDto): Promise<Result<BorrowingRecord, BusinessError>> {
    // Validate input
    const validation = this.validationService.validateReturnBook(data);
    if (!validation.isValid) {
      return Result.failure(
        new ValidationError(validation.errors.join(', '), 'return_data', data)
      );
    }

    try {
      const result = await this.repository.returnBook(data);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to return book', 'RETURN_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while returning book', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async getAllBorrowings(
    filters?: BorrowingFilters,
    sorting?: BorrowingSorting,
    pagination?: BorrowingPagination
  ): Promise<Result<BorrowingRecord[], BusinessError>> {
    try {
      const result = await this.repository.findAll(filters, sorting, pagination);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to retrieve borrowing records', 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while fetching borrowing records', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async getBorrowingById(id: number): Promise<Result<BorrowingRecord | null, BusinessError>> {
    if (!id || id <= 0) {
      return Result.failure(
        new ValidationError('Borrowing ID must be a positive number', 'id', id)
      );
    }

    try {
      const result = await this.repository.findById(id);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError(`Failed to retrieve borrowing record with ID ${id}`, 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while fetching borrowing record', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async getMemberBorrowingStatus(memberId: number): Promise<Result<MemberBorrowingStatus, BusinessError>> {
    if (!memberId || memberId <= 0) {
      return Result.failure(
        new ValidationError('Member ID must be a positive number', 'memberId', memberId)
      );
    }

    try {
      const result = await this.repository.findByMember(memberId);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError(`Failed to retrieve borrowing status for member ${memberId}`, 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while fetching member borrowing status', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async getBookBorrowingHistory(bookId: number): Promise<Result<BorrowingRecord[], BusinessError>> {
    if (!bookId || bookId <= 0) {
      return Result.failure(
        new ValidationError('Book ID must be a positive number', 'bookId', bookId)
      );
    }

    try {
      const result = await this.repository.findByBook(bookId);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError(`Failed to retrieve borrowing history for book ${bookId}`, 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while fetching book borrowing history', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async getOverdueRecords(): Promise<Result<BorrowingRecord[], BusinessError>> {
    try {
      const result = await this.repository.getOverdueRecords();
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to retrieve overdue records', 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while fetching overdue records', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async getBorrowingStatistics(): Promise<Result<BorrowingStatistics, BusinessError>> {
    try {
      const result = await this.repository.getStatistics();
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to retrieve borrowing statistics', 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while fetching borrowing statistics', 'UNKNOWN_ERROR', error)
      );
    }
  }
}