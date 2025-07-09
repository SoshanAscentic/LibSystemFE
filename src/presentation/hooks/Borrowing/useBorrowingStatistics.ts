import { useState, useEffect } from 'react';
import { BorrowingStatistics } from '../../../domain/entities/BorrowingRecord';
import { useBorrowingController } from './useBorrowingController';

interface UseBorrowingStatisticsResult {
  statistics: BorrowingStatistics | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useBorrowingStatistics = (): UseBorrowingStatisticsResult => {
  const [statistics, setStatistics] = useState<BorrowingStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useBorrowingController();

  const loadStatistics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await controller.handleGetBorrowingStatistics();
      
      setStatistics(result.statistics);
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.error || 'Failed to load borrowing statistics');
      }
    } catch (err: any) {
      console.error('useBorrowingStatistics: Unexpected error:', err);
      setError(err.message || 'Failed to load borrowing statistics');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  return {
    statistics,
    isLoading,
    error,
    refresh: loadStatistics
  };
};