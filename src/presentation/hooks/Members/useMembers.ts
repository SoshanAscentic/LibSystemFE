import { useState, useEffect } from 'react';
import { Member } from '../../../domain/entities/Member';
import { MemberFilters, MemberSorting, MemberPagination } from '../../../domain/valueObjects/MemberFilters';
import { useMembersController } from './useMembersController';

interface UseMembersResult {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useMembers = (
  filters?: MemberFilters,
  sorting?: MemberSorting,
  pagination?: MemberPagination
): UseMembersResult => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useMembersController();

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await controller.handleGetAllMembers(filters, sorting, pagination);
    
    setMembers(result.members);
    setIsLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Failed to load members');
    }
  };

  useEffect(() => {
    loadMembers();
  }, [filters, sorting, pagination]);

  return {
    members,
    isLoading,
    error,
    refresh: loadMembers
  };
};