import { BookCategory } from "../entities/Book";

export interface BookFilters {
  readonly search?: string;
  readonly category?: BookCategory;
  readonly author?: string;
  readonly isAvailable?: boolean;
}

export interface BookSorting {
  readonly sortBy?: 'title' | 'author' | 'publicationYear' | 'category';
  readonly sortDirection?: 'asc' | 'desc';
}

export interface BookPagination {
  readonly pageNumber?: number;
  readonly pageSize?: number;
}