import { useState, useEffect } from 'react';
import { BorrowingRecord } from '../../../domain/entities/BorrowingRecord';
import { BorrowingFilters, BorrowingSorting, BorrowingPagination } from '../../../domain/dtos/BorrowingDto';
import { useBorrowingController } from './useBorrowingController';

interface UseBorrowingsResult {
  borrowings: BorrowingRecord[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useBorrowings = (
  filters?: BorrowingFilters,
  sorting?: BorrowingSorting,
  pagination?: BorrowingPagination
): UseBorrowingsResult => {
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useBorrowingController();

  const loadBorrowings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await controller.handleGetAllBorrowings(filters, sorting, pagination);
      
      setBorrowings(result.borrowings);
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.error || 'Failed to load borrowing records');
      }
    } catch (err: any) {
      console.error('useBorrowings: Unexpected error:', err);
      setError(err.message || 'Failed to load borrowing records');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowings();
  }, [filters, sorting, pagination]);

  return {
    borrowings,
    isLoading,
    error,
    refresh: loadBorrowings
  };
};