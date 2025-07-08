//src/hooks/useMembers.ts
import { useState, useEffect } from 'react';
import { Member, MemberFilters } from '../../infrastructure/api/MembersApiService';
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

  const loadMembers = async () => {
    console.log('👥 useMembers: Loading members with filters:', filters);
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await controller.handleGetAllMembers(filters);
      console.log('👥 useMembers: Load result:', result);
      
      setMembers(result.members);
      setIsLoading(false);
      
      if (!result.success) {
        setError(result.error || 'Failed to load members');
      }
    } catch (err: any) {
      console.error('👥 useMembers: Unexpected error:', err);
      setError(err.message || 'Failed to load members');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('👥 useMembers: Effect triggered, loading members...');
    loadMembers();
  }, [filters]);

  return {
    members,
    isLoading,
    error,
    refresh: loadMembers
  };
};