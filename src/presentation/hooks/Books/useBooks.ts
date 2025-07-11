import { useState, useEffect, useRef } from 'react';
import { Book } from '../../../domain/entities/Book';
import { BookFilters } from '../../../domain/valueObjects/BookFilters';
import { useBooksController } from './useBooksController';

interface UseBooksResult {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useBooks = (filters?: BookFilters): UseBooksResult => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useBooksController();
  const filtersRef = useRef(filters);
  const hasLoadedRef = useRef(false);

  // Deep comparison for filters to prevent unnecessary re-renders
  const filtersChanged = useRef(false);
  if (JSON.stringify(filtersRef.current) !== JSON.stringify(filters)) {
    filtersRef.current = filters;
    filtersChanged.current = true;
  }

  const loadBooks = async () => {
    console.log('useBooks: Loading books with filters:', filters);
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await controller.handleGetAllBooks(filters);
      
      if (result.success) {
        setBooks(result.books);
        console.log('useBooks: Loaded', result.books.length, 'books');
      } else {
        setError(result.error || 'Failed to load books');
        setBooks([]);
      }
    } catch (err: any) {
      console.error('useBooks: Unexpected error:', err);
      setError(err.message || 'Failed to load books');
      setBooks([]);
    } finally {
      setIsLoading(false);
      hasLoadedRef.current = true;
    }
  };

  useEffect(() => {
    // Only load if filters changed or haven't loaded yet
    if (!hasLoadedRef.current || filtersChanged.current) {
      filtersChanged.current = false;
      loadBooks();
    }
  }, [filters]); // Only depend on filters

  return {
    books,
    isLoading,
    error,
    refresh: loadBooks
  };
};

export type { BookFilters };
