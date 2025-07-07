import { ApiClient, ApiResponse } from './ApiClient';
import { Result } from '../../shared/types/Result';
import { Member, MemberType, UserRole, MemberStatistics } from '../../domain/entities/Member';
import { CreateMemberDto, UpdateMemberDto, MemberFiltersDto } from '../../domain/dtos/MemberDto';

// Backend response interface (what your backend actually returns)
interface BackendMemberResponse {
  memberId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  memberType: string; // Backend returns string
  role: string;
  isActive: boolean;
  registrationDate: string;
  borrowedBooksCount: number;
  canBorrowBooks: boolean;
  canViewBooks: boolean;
  canViewMembers: boolean;
  canManageBooks: boolean;
  currentLoans?: any[];
  borrowingHistory?: any[];
  [key: string]: any;
}

export class MembersApiService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get all members with optional filters
   */
  async getAllMembers(filters?: MemberFiltersDto): Promise<Result<Member[], Error>> {
    try {
      console.log('👥 MembersApiService: Getting all members with filters:', filters);
      
      const response = await this.apiClient.get('/api/members', { params: filters });
      
      console.log('👥 MembersApiService: ===== FULL MEMBERS RESPONSE =====');
      console.log('👥 MembersApiService: Response:', response.data);
      
      if (response.data.success) {
        const backendMembers: BackendMemberResponse[] = response.data.data as BackendMemberResponse[];
        console.log('👥 MembersApiService: Backend members data:', backendMembers);
        
        // Map backend response to domain entities
        const members = backendMembers.map(this.mapBackendResponseToMember);
        
        console.log('👥 MembersApiService: Mapped members:', members);
        
        return Result.success(members);
      } else {
        console.error('👥 MembersApiService: API returned success: false');
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch members'));
      }
    } catch (error: any) {
      console.error('👥 MembersApiService: Get all members error:', error);
      return this.handleApiError(error, 'get all members');
    }
  }

  /**
   * Get member by ID
   */
  async getMemberById(id: number): Promise<Result<Member | null, Error>> {
    try {
      console.log('👥 MembersApiService: Getting member by ID:', id);
      
      const response = await this.apiClient.get(`/api/members/${id}`);
      
      console.log('👥 MembersApiService: Member by ID response:', response.data);
      
      if (response.data.success) {
        const backendMember: BackendMemberResponse = response.data.data as BackendMemberResponse;
        console.log('👥 MembersApiService: Backend member data:', backendMember);
        
        if (!backendMember) {
          return Result.success(null);
        }
        
        const member = this.mapBackendResponseToMember(backendMember);
        console.log('👥 MembersApiService: Mapped member:', member);
        
        return Result.success(member);
      } else {
        if (response.data.error?.code === 'NOT_FOUND') {
          return Result.success(null);
        }
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch member'));
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return Result.success(null);
      }
      return this.handleApiError(error, 'get member by ID');
    }
  }

  /**
   * Create new member
   */
  async createMember(data: CreateMemberDto): Promise<Result<Member, Error>> {
    try {
      console.log('👥 MembersApiService: Creating member with data:', { 
        ...data, 
        password: data.password ? '[HIDDEN]' : undefined 
      });
      
      const response = await this.apiClient.post('/api/members', data);
      
      console.log('👥 MembersApiService: Create member response:', response.data);
      
      if (response.data.success) {
        const backendMember: BackendMemberResponse = response.data.data as BackendMemberResponse;
        const member = this.mapBackendResponseToMember(backendMember);
        
        console.log('👥 MembersApiService: Created member:', member);
        
        return Result.success(member);
      } else {
        console.error('👥 MembersApiService: Create member failed:', response.data.error?.message);
        return Result.failure(new Error(response.data.error?.message || 'Failed to create member'));
      }
    } catch (error: any) {
      console.error('👥 MembersApiService: Create member error:', error);
      return this.handleApiError(error, 'create member');
    }
  }

  /**
   * Update member
   */
  async updateMember(id: number, data: UpdateMemberDto): Promise<Result<Member, Error>> {
    try {
      console.log('👥 MembersApiService: Updating member ID:', id, 'with data:', data);
      
      const response = await this.apiClient.put(`/api/members/${id}`, data);
      
      console.log('👥 MembersApiService: Update member response:', response.data);
      
      if (response.data.success) {
        const backendMember: BackendMemberResponse = response.data.data as BackendMemberResponse;
        const member = this.mapBackendResponseToMember(backendMember);
        
        return Result.success(member);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to update member'));
      }
    } catch (error: any) {
      return this.handleApiError(error, 'update member');
    }
  }

  /**
   * Delete member
   */
  async deleteMember(id: number): Promise<Result<void, Error>> {
    try {
      console.log('🌐 MembersApiService: Making DELETE request for member ID:', id);
      
      const response = await this.apiClient.delete(`/api/members/${id}`);
      console.log('🌐 MembersApiService: DELETE response:', response.data);
      
      // Check if the response indicates success
      if (response.data.success) {
        console.log('🌐 MembersApiService: Delete successful');
        return Result.success(undefined);
      } else {
        console.error('🌐 MembersApiService: API returned success: false');
        const errorMessage = response.data.error?.message || 'Delete operation failed';
        console.error('🌐 MembersApiService: Error message:', errorMessage);
        return Result.failure(new Error(errorMessage));
      }
    } catch (error: any) {
      console.error('🌐 MembersApiService: DELETE request failed:', error);
      
      // Handle different HTTP status codes
      if (error.response) {
        const status = error.response.status;
        console.log('🌐 MembersApiService: HTTP status:', status);
        console.log('🌐 MembersApiService: Response data:', error.response.data);
        
        switch (status) {
          case 404:
            console.warn('🌐 MembersApiService: Member not found (404) - might already be deleted');
            return Result.success(undefined);
            
          case 400:
            const badRequestMessage = error.response.data?.error?.message || 
                                    error.response.data?.message || 
                                    'Bad request';
            return Result.failure(new Error(badRequestMessage));
            
          case 403:
            return Result.failure(new Error('Access denied - insufficient permissions'));
            
          case 409:
            return Result.failure(new Error('Cannot delete member - they may have active borrowings or dependencies'));
            
          case 500:
            return Result.failure(new Error('Server error occurred while deleting member'));
            
          default:
            return Result.failure(new Error(`HTTP ${status}: ${error.response.data?.message || 'Delete failed'}`));
        }
      } else if (error.request) {
        console.error('🌐 MembersApiService: Network error - no response received');
        return Result.failure(new Error('Network error - could not reach server'));
      } else {
        console.error('🌐 MembersApiService: Request setup error:', error.message);
        return Result.failure(new Error(`Request error: ${error.message}`));
      }
    }
  }

  /**
   * Search members
   */
  async searchMembers(query: string, filters?: MemberFiltersDto): Promise<Result<Member[], Error>> {
    try {
      const searchFilters = { search: query, ...filters };
      console.log('👥 MembersApiService: Searching members with query:', query, 'and filters:', searchFilters);
      
      const response = await this.apiClient.get('/api/members', { params: searchFilters });
      
      if (response.data.success) {
        const backendMembers: BackendMemberResponse[] = response.data.data as BackendMemberResponse[];
        const members = backendMembers.map(this.mapBackendResponseToMember);
        
        return Result.success(members);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to search members'));
      }
    } catch (error: any) {
      return this.handleApiError(error, 'search members');
    }
  }

  /**
   * Get member statistics
   */
  async getMemberStatistics(id: number): Promise<Result<MemberStatistics, Error>> {
    try {
      const response = await this.apiClient.get(`/api/members/${id}/statistics`);
      
      if (response.data.success) {
        return Result.success(response.data.data as MemberStatistics);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to get member statistics'));
      }
    } catch (error: any) {
      return this.handleApiError(error, 'get member statistics');
    }
  }

  /**
   * Get member borrowing history
   */
  async getMemberBorrowingHistory(id: number): Promise<Result<Member, Error>> {
    try {
      const response = await this.apiClient.get(`/api/members/${id}/borrowing-history`);
      
      if (response.data.success) {
        const backendMember: BackendMemberResponse = response.data.data as BackendMemberResponse;
        const member = this.mapBackendResponseToMember(backendMember);
        
        return Result.success(member);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to get member borrowing history'));
      }
    } catch (error: any) {
      return this.handleApiError(error, 'get member borrowing history');
    }
  }

  /**
   * Map backend response to domain Member entity
   */
  private mapBackendResponseToMember(backendData: BackendMemberResponse): Member {
    console.log('👥 MembersApiService: Mapping backend data:', backendData);
    
    try {
      if (!backendData) {
        throw new Error('Backend member data is null or undefined');
      }

      // Map member type from string to enum
      const memberType = this.mapMemberTypeFromString(backendData.memberType);
      const role = this.mapRoleFromString(backendData.role);

      const member: Member = {
        memberId: backendData.memberId || 0,
        firstName: backendData.firstName || '',
        lastName: backendData.lastName || '',
        fullName: backendData.fullName || `${backendData.firstName || ''} ${backendData.lastName || ''}`.trim(),
        email: backendData.email || '',
        memberType: memberType,
        role: role,
        isActive: backendData.isActive !== false,
        registrationDate: new Date(backendData.registrationDate || new Date()),
        borrowedBooksCount: backendData.borrowedBooksCount || 0,
        canBorrowBooks: backendData.canBorrowBooks !== false,
        canViewBooks: backendData.canViewBooks !== false,
        canViewMembers: backendData.canViewMembers !== false,
        canManageBooks: backendData.canManageBooks !== false,
        currentLoans: backendData.currentLoans || [],
        borrowingHistory: backendData.borrowingHistory || [],
      };

      console.log('👥 MembersApiService: Mapped member:', member);
      return member;
      
    } catch (error) {
      console.error('👥 MembersApiService: Member mapping error:', error);
      console.error('👥 MembersApiService: Input backendData:', backendData);
      throw new Error(`Failed to map member: ${error}`);
    }
  }

  /**
   * Map member type string to enum
   */
  private mapMemberTypeFromString(memberType: string): MemberType {
    switch (memberType?.toLowerCase()) {
      case 'regularmember':
      case 'regular_member':
      case 'member':
        return MemberType.REGULAR_MEMBER;
      case 'minorstaff':
      case 'minor_staff':
        return MemberType.MINOR_STAFF;
      case 'managementstaff':
      case 'management_staff':
        return MemberType.MANAGEMENT_STAFF;
      default:
        console.warn('👥 MembersApiService: Unknown member type:', memberType, 'defaulting to RegularMember');
        return MemberType.REGULAR_MEMBER;
    }
  }

  /**
   * Map role string to enum
   */
  private mapRoleFromString(role: string): UserRole {
    switch (role?.toLowerCase()) {
      case 'member':
        return UserRole.MEMBER;
      case 'minorstaff':
      case 'minor_staff':
        return UserRole.MINOR_STAFF;
      case 'managementstaff':
      case 'management_staff':
        return UserRole.MANAGEMENT_STAFF;
      case 'administrator':
      case 'admin':
        return UserRole.ADMINISTRATOR;
      default:
        console.warn('👥 MembersApiService: Unknown role:', role, 'defaulting to Member');
        return UserRole.MEMBER;
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleApiError(error: any, operation: string): Result<any, Error> {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error(`👥 MembersApiService: ${operation} HTTP Status:`, status);
      console.error(`👥 MembersApiService: ${operation} Error Response:`, errorData);
      
      switch (status) {
        case 401:
          const message = errorData?.detail || errorData?.error?.message || 'Unauthorized access';
          return Result.failure(new Error(message));
        case 400:
          const validationMessage = errorData?.detail || errorData?.error?.message || 'Invalid request format';
          return Result.failure(new Error(validationMessage));
        case 409:
          const conflictMessage = errorData?.detail || errorData?.error?.message || 'Member already exists';
          return Result.failure(new Error(conflictMessage));
        case 500:
          return Result.failure(new Error('Server error - please try again later'));
        case 404:
          return Result.failure(new Error(`${operation} service unavailable`));
        default:
          return Result.failure(new Error(`Network error (${status})`));
      }
    } else if (error.request) {
      console.error(`👥 MembersApiService: ${operation} network error - no response from server`);
      return Result.failure(new Error('Cannot connect to server - please check your connection'));
    } else {
      console.error(`👥 MembersApiService: ${operation} unexpected error:`, error.message);
      return Result.failure(new Error(error.message || 'An unexpected error occurred'));
    }
  }
}