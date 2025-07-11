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
      console.log('useMemberBorrowingStatus: No memberId provided');
      setStatus(null);
      setIsLoading(false);
      setError(null);
      return;
    }
    
    console.log('useMemberBorrowingStatus: Loading status for member:', memberId);
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await controller.handleGetMemberBorrowingStatus(memberId);
      
      console.log('useMemberBorrowingStatus: API result:', result);
      
      if (result.success) {
        setStatus(result.status);
        console.log('useMemberBorrowingStatus: Status loaded successfully:', result.status);
        console.log('useMemberBorrowingStatus: Current borrowings count:', result.status?.currentBorrowings?.length || 0);
      } else {
        setStatus(null);
        setError(result.error || 'Failed to load member borrowing status');
        console.error('useMemberBorrowingStatus: Failed to load status:', result.error);
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('useMemberBorrowingStatus: Unexpected error:', err);
      setError(err.message || 'Failed to load member borrowing status');
      setStatus(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('useMemberBorrowingStatus: useEffect triggered with memberId:', memberId);
    loadMemberStatus();
  }, [memberId]); // Only depend on memberId

  return {
    status,
    isLoading,
    error,
    refresh: loadMemberStatus
  };
};