export interface Member {
  readonly memberId: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly email: string;
  readonly memberType: MemberType;
  readonly role: UserRole;
  readonly isActive: boolean;
  readonly registrationDate: Date;
  readonly borrowedBooksCount: number;
  readonly canBorrowBooks: boolean;
  readonly canViewBooks: boolean;
  readonly canViewMembers: boolean;
  readonly canManageBooks: boolean;
  readonly currentLoans?: BorrowedBook[];
  readonly borrowingHistory?: BorrowingRecord[];
}

export enum MemberType {
  REGULAR_MEMBER = 'RegularMember',
  MINOR_STAFF = 'MinorStaff',
  MANAGEMENT_STAFF = 'ManagementStaff',
  ADMINISTRATOR = 'Administrator'  
}

export enum UserRole {
  MEMBER = 'Member',
  MINOR_STAFF = 'MinorStaff', 
  MANAGEMENT_STAFF = 'ManagementStaff',
  ADMINISTRATOR = 'Administrator'  
}

export interface BorrowedBook {
  readonly bookId: number;
  readonly title: string;
  readonly author: string;
  readonly borrowedAt: Date;
  readonly dueDate: Date;
  readonly daysBorrowed: number;
  readonly isOverdue: boolean;
}

export interface BorrowingRecord {
  readonly recordId: number;
  readonly bookId: number;
  readonly bookTitle: string;
  readonly bookAuthor: string;
  readonly borrowedAt: Date;
  readonly returnedAt?: Date;
  readonly dueDate: Date;
  readonly isOverdue: boolean;
  readonly daysBorrowed: number;
}

export interface MemberStatistics {
  readonly totalBooksBorrowed: number;
  readonly currentlyBorrowed: number;
  readonly overdueBooks: number;
  readonly membershipDurationDays: number;
  readonly averageBorrowingDuration: number;
}