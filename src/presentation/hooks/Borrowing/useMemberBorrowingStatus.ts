import { useState, useEffect } from 'react';
import { MemberBorrowingStatus } from '../../../domain/entities/BorrowingRecord';
import { useBorrowingController } from './useBorrowingController';

interface UseMemberBorrowingStatusResult {
  status: MemberBorrowingStatus | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useMemberBorrowingStatus = (memberId?: number): UseMemberBorrowingStatusResult => {
  const [status, setStatus] = useState<MemberBorrowingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useBorrowingController();

  const loadMemberStatus = async () => {
    if (!memberId) {
      setStatus(null);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await controller.handleGetMemberBorrowingStatus(memberId);
      
      setStatus(result.status);
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.error || 'Failed to load member borrowing status');
      }
    } catch (err: any) {
      console.error('useMemberBorrowingStatus: Unexpected error:', err);
      setError(err.message || 'Failed to load member borrowing status');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemberStatus();
  }, [memberId]);

  return {
    status,
    isLoading,
    error,
    refresh: loadMemberStatus
  };
};