export interface BorrowingRecord {
  readonly borrowingId: number;
  readonly bookId: number;
  readonly memberId: number;
  readonly bookTitle: string;
  readonly bookAuthor: string;
  readonly memberName: string;
  readonly memberEmail: string;
  readonly borrowedAt: Date;
  readonly dueDate: Date;
  readonly returnedAt?: Date;
  readonly isReturned: boolean;
  readonly isOverdue: boolean;
  readonly daysBorrowed: number;
  readonly daysOverdue: number;
  readonly lateFee: number;
  readonly status: BorrowingStatus;
}

export enum BorrowingStatus {
  ACTIVE = 'Active',
  RETURNED = 'Returned',
  OVERDUE = 'Overdue'
}

export interface BorrowingStatistics {
  readonly totalBorrowings: number;
  readonly activeBorrowings: number;
  readonly overdueBorrowings: number;
  readonly totalReturned: number;
  readonly averageBorrowingDuration: number;
  readonly totalLateFees: number;
}

export interface MemberBorrowingStatus {
  readonly memberId: number;
  readonly memberName: string;
  readonly memberEmail: string;
  readonly memberType: string;
  readonly borrowedBooksCount: number;
  readonly maxBooksAllowed: number;
  readonly canBorrowBooks: boolean;
  readonly canBorrowMoreBooks: boolean;
  readonly currentBorrowings: BorrowingRecord[];
  readonly recentHistory: BorrowingRecord[];
  readonly overdueBorrowings: BorrowingRecord[];
  readonly totalLateFees: number;
}