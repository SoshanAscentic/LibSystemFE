import { useState, useEffect } from 'react';
import { BorrowingRecord } from '../../../domain/entities/BorrowingRecord';
import { useBorrowingController } from './useBorrowingController';

interface UseBorrowingResult {
  borrowing: BorrowingRecord | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useBorrowing = (id: number): UseBorrowingResult => {
  const [borrowing, setBorrowing] = useState<BorrowingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useBorrowingController();

  const loadBorrowing = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await controller.handleGetBorrowingById(id);
      
      setBorrowing(result.borrowing);
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.error || 'Failed to load borrowing record');
      }
    } catch (err: any) {
      console.error('useBorrowing: Unexpected error:', err);
      setError(err.message || 'Failed to load borrowing record');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowing();
  }, [id]);

  return {
    borrowing,
    isLoading,
    error,
    refresh: loadBorrowing
  };
};