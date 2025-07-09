import { useState, useEffect } from 'react';
import { BorrowingRecord } from '../../../domain/entities/BorrowingRecord';
import { useBorrowingController } from './useBorrowingController';

interface UseActiveBorrowingsResult {
  activeBorrowings: BorrowingRecord[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useActiveBorrowings = (): UseActiveBorrowingsResult => {
  const [activeBorrowings, setActiveBorrowings] = useState<BorrowingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useBorrowingController();

  const loadActiveBorrowings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await controller.handleGetAllBorrowings(
        { status: 'Active' as any }, 
        { sortBy: 'dueDate', sortDirection: 'asc' }
      );
      
      setActiveBorrowings(result.borrowings);
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.error || 'Failed to load active borrowings');
      }
    } catch (err: any) {
      console.error('useActiveBorrowings: Unexpected error:', err);
      setError(err.message || 'Failed to load active borrowings');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActiveBorrowings();
  }, []);

  return {
    activeBorrowings,
    isLoading,
    error,
    refresh: loadActiveBorrowings
  };
};