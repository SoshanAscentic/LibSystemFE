// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
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

// User & Authentication Types
export interface User {
  id: number;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  roles: string[];
  memberId?: number;
}

export interface AuthenticationResponse {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  token: string;
  expiresAt: string;
  memberId?: number;
}

// Book Types
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

// Member Types
export interface Member {
  memberID: number;
  name: string;
  memberType: MemberType;
  borrowedBooksCount: number;
  canBorrowBooks: boolean;
  canViewBooks: boolean;
  canViewMembers: boolean;
  canManageBooks: boolean;
}

export enum MemberType {
  Member = 'Member',
  MinorStaff = 'Minor Staff',
  ManagementStaff = 'Management Staff'
}

// Borrowing Types
export interface BorrowingStatus {
  memberId: number;
  memberName: string;
  memberType: string;
  borrowedBooksCount: number;
  canBorrowBooks: boolean;
  canBorrowMoreBooks: boolean;
  borrowedBooks: BorrowedBook[];
}

export interface BorrowedBook {
  bookId: number;
  title: string;
  author: string;
  borrowedAt: string;
  daysBorrowed: number;
  isOverdue: boolean;
}

// UI Types
export interface LoadingState {
  [key: string]: boolean;
}

// Notification types for Sonner
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}