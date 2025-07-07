import { useState, useEffect } from 'react';
import { Member } from '../../domain/entities/Member';
import { useMembersController } from './useMembersController';

interface UseMemberResult {
  member: Member | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useMember = (id: number): UseMemberResult => {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const controller = useMembersController();

  const loadMember = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    const result = await controller.handleGetMemberById(id);
    
    setMember(result.member);
    setIsLoading(false);
    
    if (!result.success) {
      setError(result.error || 'Failed to load member');
    }
  };

  useEffect(() => {
    loadMember();
  }, [id]);

  return {
    member,
    isLoading,
    error,
    refresh: loadMember
  };
};