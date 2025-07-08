import { useState, useEffect } from 'react';
import { Member } from '../../../domain/entities/Member';
import { useMembersController } from './useMembersController';

interface UseMembersResult {
  members: Member[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useMembers = (): UseMembersResult => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useMembersController();

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    
    const result = await controller.handleGetAllMembers();
    
    setMembers(result.members);
    setIsLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Failed to load members');
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  return {
    members,
    isLoading,
    error,
    refresh: loadMembers
  };
};