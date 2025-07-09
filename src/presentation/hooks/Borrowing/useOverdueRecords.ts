import { useState, useEffect } from 'react';
import { BorrowingRecord } from '../../../domain/entities/BorrowingRecord';
import { useBorrowingController } from './useBorrowingController';

interface UseOverdueRecordsResult {
  overdueRecords: BorrowingRecord[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useOverdueRecords = (): UseOverdueRecordsResult => {
  const [overdueRecords, setOverdueRecords] = useState<BorrowingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useBorrowingController();

  const loadOverdueRecords = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await controller.handleGetOverdueRecords();
      
      setOverdueRecords(result.overdue);
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.error || 'Failed to load overdue records');
      }
    } catch (err: any) {
      console.error('useOverdueRecords: Unexpected error:', err);
      setError(err.message || 'Failed to load overdue records');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverdueRecords();
  }, []);

  return {
    overdueRecords,
    isLoading,
    error,
    refresh: loadOverdueRecords
  };
};