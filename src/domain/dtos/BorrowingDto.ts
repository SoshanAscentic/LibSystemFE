import { BorrowingStatus } from "../entities/BorrowingRecord";

export interface BorrowBookDto {
  readonly bookId: number;
  readonly memberId: number;
  readonly dueDate?: string; 
}

export interface ReturnBookDto {
  readonly borrowingId: number;
  readonly returnDate?: string; 
  readonly condition?: string;
  readonly notes?: string;
}

export interface BorrowingFilters {
  readonly memberId?: number;
  readonly bookId?: number;
  readonly status?: BorrowingStatus;
  readonly isOverdue?: boolean;
  readonly borrowedAfter?: string;
  readonly borrowedBefore?: string;
  readonly dueAfter?: string;
  readonly dueBefore?: string;
  readonly returnedAfter?: string;
  readonly returnedBefore?: string;
}

export interface BorrowingSorting {
  readonly sortBy?: 'borrowedAt' | 'dueDate' | 'returnedAt' | 'memberName' | 'bookTitle';
  readonly sortDirection?: 'asc' | 'desc';
}

export interface BorrowingPagination {
  readonly pageNumber?: number;
  readonly pageSize?: number;
}