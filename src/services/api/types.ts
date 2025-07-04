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

export interface UpdateBookDto extends CreateBookDto {
  bookId: number;
}

export interface BookFilters {
  search?: string;
  category?: BookCategory;
  author?: string;
  isAvailable?: boolean;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'title' | 'author' | 'publicationYear' | 'category';
  sortDirection?: 'asc' | 'desc';
}