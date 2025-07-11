import { useState, useEffect } from 'react';
import { Book } from '../../../domain/entities/Book';
import { useBooksController } from './useBooksController';

interface UseBookResult {
  book: Book | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useBook = (id: number): UseBookResult => {
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useBooksController();

  const loadBook = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    const result = await controller.handleGetBookById(id);
    
    setBook(result.book);
    setIsLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Failed to load book');
    }
  };

  useEffect(() => {
    loadBook();
  }, [id]);

  return {
    book,
    isLoading,
    error,
    refresh: loadBook
  };
};