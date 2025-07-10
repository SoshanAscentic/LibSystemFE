//src/presentation/hooks/Members/useMembers.ts - Fixed version
import { useState, useEffect, useRef } from 'react';
import { Member } from '../../../domain/entities/Member';
import { MemberFilters } from '../../../domain/valueObjects/MemberFilters';
import { useMembersController } from './useMembersController';

interface UseMembersResult {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useMembers = (filters?: MemberFilters): UseMembersResult => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useMembersController();
  const filtersRef = useRef(filters);
  const hasLoadedRef = useRef(false);

  // Deep comparison for filters to prevent unnecessary re-renders
  const filtersChanged = useRef(false);
  if (JSON.stringify(filtersRef.current) !== JSON.stringify(filters)) {
    filtersRef.current = filters;
    filtersChanged.current = true;
  }

  const loadMembers = async () => {
    console.log('useMembers: Loading members with filters:', filters);
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await controller.handleGetAllMembers(filters);
      
      if (result.success) {
        setMembers(result.members);
        console.log('useMembers: Loaded', result.members.length, 'members');
      } else {
        setError(result.error || 'Failed to load members');
        setMembers([]);
      }
    } catch (err: any) {
      console.error('useMembers: Unexpected error:', err);
      setError(err.message || 'Failed to load members');
      setMembers([]);
    } finally {
      setIsLoading(false);
      hasLoadedRef.current = true;
    }
  };

  useEffect(() => {
    // Only load if filters changed or haven't loaded yet
    if (!hasLoadedRef.current || filtersChanged.current) {
      filtersChanged.current = false;
      loadMembers();
    }
  }, [filters]); // Only depend on filters

  return {
    members,
    isLoading,
    error,
    refresh: loadMembers
  };
};