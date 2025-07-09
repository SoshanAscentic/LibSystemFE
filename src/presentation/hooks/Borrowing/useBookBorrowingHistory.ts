import { useState, useEffect } from 'react';
import { BorrowingRecord } from '../../../domain/entities/BorrowingRecord';
import { useBorrowingController } from './useBorrowingController';

interface UseBookBorrowingHistoryResult {
  history: BorrowingRecord[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useBookBorrowingHistory = (bookId?: number): UseBookBorrowingHistoryResult => {
  const [history, setHistory] = useState<BorrowingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useBorrowingController();

  const loadBookHistory = async () => {
    if (!bookId) {
      setHistory([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await controller.handleGetBookBorrowingHistory(bookId);
      
      setHistory(result.history);
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.error || 'Failed to load book borrowing history');
      }
    } catch (err: any) {
      console.error('useBookBorrowingHistory: Unexpected error:', err);
      setError(err.message || 'Failed to load book borrowing history');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookHistory();
  }, [bookId]);

  return {
    history,
    isLoading,
    error,
    refresh: loadBookHistory
  };
};