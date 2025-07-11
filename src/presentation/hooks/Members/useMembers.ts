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

export const useMembers = (filters?: MemberFilters | null): UseMembersResult => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Changed default to false
  const [error, setError] = useState<string | null>(null);
  
  const controller = useMembersController();
  const filtersRef = useRef(filters);
  const hasLoadedRef = useRef(false);

  // If filters is null, don't load anything
  const shouldLoad = filters !== null;

  // Deep comparison for filters to prevent unnecessary re-renders
  const filtersChanged = useRef(false);
  if (JSON.stringify(filtersRef.current) !== JSON.stringify(filters)) {
    filtersRef.current = filters;
    filtersChanged.current = true;
  }

  const loadMembers = async () => {
    if (!shouldLoad) {
      console.log('useMembers: Skipping load (filters is null)');
      setMembers([]);
      setIsLoading(false);
      setError(null);
      return;
    }

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
    // Only load if shouldLoad and (filters changed or haven't loaded yet)
    if (shouldLoad && (!hasLoadedRef.current || filtersChanged.current)) {
      filtersChanged.current = false;
      loadMembers();
    } else if (!shouldLoad) {
      // Clear data if we shouldn't load
      setMembers([]);
      setIsLoading(false);
      setError(null);
      hasLoadedRef.current = false;
    }
  }, [shouldLoad, filters]); // Depend on shouldLoad and filters

  return {
    members,
    isLoading,
    error,
    refresh: loadMembers
  };
};