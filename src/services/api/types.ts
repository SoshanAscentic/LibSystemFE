export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    type: string;
    validationErrors?: Record<string, string[]>;
  };
  timestamp: string;
  traceId: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Book-specific types
export interface Book {
  bookId: number;
  title: string;
  author: string;
  publicationYear: number;
  category: BookCategory;
  isAvailable: boolean;
}

export enum BookCategory {
  Fiction = 'Fiction',
  History = 'History',
  Child = 'Child'
}

export interface CreateBookDto {
  title: string;
  author: string;
  publicationYear: number;
  category: number; // 0=Fiction, 1=History, 2=Child
}

// Simplified BookFilters - only category and author
export interface BookFilters {
  category?: BookCategory;
  author?: string;
  // Sorting options
  sortBy?: 'title' | 'author' | 'publicationYear' | 'category';
  sortDirection?: 'asc' | 'desc';
  // Pagination options
  pageNumber?: number;
  pageSize?: number;
}

// Member-specific types
export interface Member {
  memberId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  memberType: MemberType;
  role: UserRole;
  isActive: boolean;
  registrationDate: string;
  borrowedBooksCount: number;
  canBorrowBooks: boolean;
  canViewBooks: boolean;
  canViewMembers: boolean;
  canManageBooks: boolean;
  currentLoans?: BorrowedBook[];
  borrowingHistory?: BorrowingRecord[];
}

export enum MemberType {
  REGULAR_MEMBER = 'RegularMember',
  MINOR_STAFF = 'MinorStaff',
  MANAGEMENT_STAFF = 'ManagementStaff'
}

export enum UserRole {
  MEMBER = 'Member',
  MINOR_STAFF = 'MinorStaff', 
  MANAGEMENT_STAFF = 'ManagementStaff',
  ADMINISTRATOR = 'Administrator'
}

export interface BorrowedBook {
  bookId: number;
  title: string;
  author: string;
  borrowedAt: string;
  dueDate: string;
  daysBorrowed: number;
  isOverdue: boolean;
}

export interface BorrowingRecord {
  recordId: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  borrowedAt: string;
  returnedAt?: string;
  dueDate: string;
  isOverdue: boolean;
  daysBorrowed: number;
}

export interface CreateMemberDto {
  firstName: string;
  lastName: string;
  email: string;
  memberType: number; // 0=RegularMember, 1=MinorStaff, 2=ManagementStaff
  password?: string;
}

export interface UpdateMemberDto extends CreateMemberDto {
  memberId: number;
  isActive: boolean;
}

export interface MemberFilters {
  search?: string;
  memberType?: MemberType;
  isActive?: boolean;
  hasBorrowedBooks?: boolean;
  isOverdue?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'registrationDate' | 'borrowedBooksCount';
  sortDirection?: 'asc' | 'desc';
}