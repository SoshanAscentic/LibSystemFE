import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi } from '../../services/api/members';
import { MemberFilters, CreateMemberDto } from '../../services/api/types';
import { toast } from 'sonner';

// Query keys for consistent cache management
export const membersQueryKeys = {
  all: ['members'] as const,
  lists: () => [...membersQueryKeys.all, 'list'] as const,
  list: (filters: MemberFilters) => [...membersQueryKeys.lists(), filters] as const,
  details: () => [...membersQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...membersQueryKeys.details(), id] as const,
  statistics: (id: number) => [...membersQueryKeys.all, 'statistics', id] as const,
  borrowingHistory: (id: number) => [...membersQueryKeys.all, 'borrowing-history', id] as const,
};

// Get all members with filters
export const useMembers = (filters?: MemberFilters) => {
  return useQuery({
    queryKey: membersQueryKeys.list(filters || {}),
    queryFn: () => membersApi.getAll(filters),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get member by ID
export const useMember = (id: number) => {
  return useQuery({
    queryKey: membersQueryKeys.detail(id),
    queryFn: () => membersApi.getById(id),
    select: (response) => response.data,
    enabled: !!id,
  });
};

// Get member statistics
export const useMemberStatistics = (id: number) => {
  return useQuery({
    queryKey: membersQueryKeys.statistics(id),
    queryFn: () => membersApi.getStatistics(id),
    select: (response) => response.data,
    enabled: !!id,
  });
};

// Get member borrowing history
export const useMemberBorrowingHistory = (id: number) => {
  return useQuery({
    queryKey: membersQueryKeys.borrowingHistory(id),
    queryFn: () => membersApi.getBorrowingHistory(id),
    select: (response) => response.data,
    enabled: !!id,
  });
};

// Create member mutation
export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: membersApi.create,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: membersQueryKeys.lists() });
      toast.success(response.message || 'Member created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to create member';
      toast.error(message);
    },
  });
};

// Update member mutation
export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateMemberDto }) => 
      membersApi.update(id, data),
    onSuccess: (response: any, variables) => {
      queryClient.invalidateQueries({ queryKey: membersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: membersQueryKeys.detail(variables.id) });
      toast.success(response.message || 'Member updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to update member';
      toast.error(message);
    },
  });
};

// Delete member mutation
export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: membersApi.delete,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: membersQueryKeys.lists() });
      toast.success(response.message || 'Member deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to delete member';
      toast.error(message);
    },
  });
};