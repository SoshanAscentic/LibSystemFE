import { useState, useEffect } from 'react';
import { Book } from '../../../domain/entities/Book';
import { BookFilters, BookSorting, BookPagination } from '../../../domain/valueObjects/BookFilters';
import { useBooksController } from './useBooksController';

interface UseBooksResult {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useBooks = (
  filters?: BookFilters,
  sorting?: BookSorting,
  pagination?: BookPagination
): UseBooksResult => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useBooksController();

  const loadBooks = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await controller.handleGetAllBooks(filters, sorting, pagination);
    
    setBooks(result.books);
    setIsLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Failed to load books');
    }
  };

  useEffect(() => {
    loadBooks();
  }, [filters, sorting, pagination]);

  return {
    books,
    isLoading,
    error,
    refresh: loadBooks
  };
};
