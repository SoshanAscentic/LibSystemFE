import { MemberType } from "../entities/Member";

export interface MemberFilters {
  readonly search?: string;
  readonly memberType?: MemberType;
  readonly isActive?: boolean;
  readonly hasBorrowedBooks?: boolean;
  readonly isOverdue?: boolean;
}

export interface MemberSorting {
  readonly sortBy?: 'firstName' | 'lastName' | 'email' | 'registrationDate' | 'borrowedBooksCount';
  readonly sortDirection?: 'asc' | 'desc';
}

export interface MemberPagination {
  readonly pageNumber?: number;
  readonly pageSize?: number;
}