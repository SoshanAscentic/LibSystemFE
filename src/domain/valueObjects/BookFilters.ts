import { BookCategory } from "../entities/Book";

export interface BookFilters {
  readonly category?: BookCategory;
  readonly author?: string;
}

export interface BookSorting {
  readonly sortBy?: 'title' | 'author' | 'publicationYear' | 'category';
  readonly sortDirection?: 'asc' | 'desc';
}

export interface BookPagination {
  readonly pageNumber?: number;
  readonly pageSize?: number;
}