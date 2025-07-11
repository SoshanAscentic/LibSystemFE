import { apiClient } from '../api/client';
import { ApiResponse, Member, CreateMemberDto, MemberFilters } from './types';

export const membersApi = {
  // Get all members with optional filters
  getAll: async (filters?: MemberFilters): Promise<ApiResponse<Member[]>> => {
    const response = await apiClient.get('/api/members', { params: filters });
    return response.data;
  },

  // Get member by ID
  getById: async (id: number): Promise<ApiResponse<Member>> => {
    const response = await apiClient.get(`/api/members/${id}`);
    return response.data;
  },

  // Create new member (Admin only)
  create: async (data: CreateMemberDto): Promise<ApiResponse<Member>> => {
    const response = await apiClient.post('/api/members', data);
    return response.data;
  },

  // Update member (Admin only)
  update: async (id: number, data: CreateMemberDto): Promise<ApiResponse<Member>> => {
    const response = await apiClient.put(`/api/members/${id}`, data);
    return response.data;
  },

  // Delete member (Admin only)
  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/api/members/${id}`);
    return response.data;
  },

  // Search members with debouncing support
  search: async (query: string, filters?: Omit<MemberFilters, 'search'>): Promise<ApiResponse<Member[]>> => {
    const response = await apiClient.get('/api/members', {
      params: { search: query, ...filters }
    });
    return response.data;
  },

  // Get member statistics
  getStatistics: async (id: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/api/members/${id}/statistics`);
    return response.data;
  },

  // Get member borrowing history
  getBorrowingHistory: async (id: number): Promise<ApiResponse<Member>> => {
    const response = await apiClient.get(`/api/members/${id}/borrowing-history`);
    return response.data;
  }
};