import { useState, useEffect } from 'react';
import { Book } from '../../../domain/entities/Book';
import { BookFilters, BookSorting, BookPagination } from '../../../domain/valueObjects/BookFilters';
import { useBooksController } from './useBooksController';

interface UseBooksResult {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
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
    
    try {
      const result = await controller.handleGetAllBooks(filters, sorting, pagination);
      
      setBooks(result.books);
      
      if (!result.success) {
        setError(result.error || 'Failed to load books');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setBooks([]);
    } finally {
      setIsLoading(false);
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