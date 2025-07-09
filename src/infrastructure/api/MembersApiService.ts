import { ApiClient, ApiResponse } from './ApiClient';
import { Result } from '../../shared/types/Result';
import { Member, MemberType, UserRole } from '../../domain/entities/Member';

// Backend response interface
interface BackendMemberResponse {
  memberID: number;        
  name: string;           
  email?: string;         
  memberType: string;
  role?: string;
  isActive: boolean;
  registrationDate?: string;
  borrowedBooksCount: number;
  canBorrowBooks: boolean;
  canViewBooks?: boolean;
  canViewMembers?: boolean;
  canManageBooks?: boolean;
  currentLoans?: any[];
  borrowingHistory?: any[];
  [key: string]: any;
}

// Registration DTO for /api/auth/register
export interface RegisterMemberDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  memberType: number; // 0=RegularMember, 1=MinorStaff, 2=ManagementStaff
}

export class MembersApiService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get all members (no filtering)
   */
  async getAllMembers(): Promise<Result<Member[], Error>> {
    try {
      console.log('MembersApiService: Getting all members');
      
      const response = await this.apiClient.get('/api/members');
      
      console.log('MembersApiService: Response:', response.data);
      
      if (response.data.success) {
        const backendMembers: BackendMemberResponse[] = response.data.data as BackendMemberResponse[];
        const members = backendMembers.map(member => this.mapBackendResponseToMember(member));
        return Result.success(members);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch members'));
      }
    } catch (error: any) {
      console.error('MembersApiService: Get all members error:', error);
      return this.handleApiError(error, 'get all members');
    }
  }

  /**
   * Get member by ID
   */
  async getMemberById(id: number): Promise<Result<Member | null, Error>> {
    try {
      console.log('MembersApiService: Getting member by ID:', id);
      
      const response = await this.apiClient.get(`/api/members/${id}`);
      
      if (response.data.success) {
        const backendMember: BackendMemberResponse = response.data.data as BackendMemberResponse;
        
        if (!backendMember) {
          return Result.success(null);
        }
        
        const member = this.mapBackendResponseToMember(backendMember);
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
   * Register new member using /api/auth/register
   */
  async registerMember(data: RegisterMemberDto): Promise<Result<Member, Error>> {
    try {
      console.log('MembersApiService: Registering member:', { 
        ...data, 
        password: '[HIDDEN]',
        confirmPassword: '[HIDDEN]'
      });
      
      const response = await this.apiClient.post('/api/auth/register', data);
      
      console.log('MembersApiService: Register response:', response.data);
      
      if (response.data.success) {
        const backendMember: BackendMemberResponse = response.data.data as BackendMemberResponse;
        const member = this.mapBackendResponseToMember(backendMember);
        return Result.success(member);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to register member'));
      }
    } catch (error: any) {
      console.error('MembersApiService: Register member error:', error);
      return this.handleApiError(error, 'register member');
    }
  }

  /**
   * Map backend response to domain Member entity
   */
  private mapBackendResponseToMember(backendData: BackendMemberResponse): Member {
    try {
      if (!backendData) {
        throw new Error('Backend member data is null or undefined');
      }

      console.log('MembersApiService: Mapping backend data:', backendData);

      // Parse the single "name" field into firstName and lastName
      const fullName = backendData.name || '';
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const memberType = this.mapMemberTypeFromString(backendData.memberType);
      const role = this.mapRoleFromString(backendData.role || backendData.memberType);

      const member: Member = {
        memberId: backendData.memberID || 0,  // Note: backend uses "memberID"
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
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

      console.log('MembersApiService: Mapped member:', member);
      return member;
    } catch (error) {
      console.error('MembersApiService: Member mapping error:', error);
      throw new Error(`Failed to map member: ${error}`);
    }
  }

  /**
   * Map member type string to enum
   */
  private mapMemberTypeFromString(memberType: string): MemberType {
    const normalizedType = memberType?.toLowerCase().replace(/\s+/g, '');
    
    switch (normalizedType) {
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
        console.warn('MembersApiService: Unknown member type:', memberType, 'normalized:', normalizedType);
        return MemberType.REGULAR_MEMBER;
    }
  }

  /**
   * Map role string to enum
   */
  private mapRoleFromString(role: string): UserRole {
    const normalizedRole = role?.toLowerCase().replace(/\s+/g, '');
    
    switch (normalizedRole) {
      case 'member':
      case 'regularmember':
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
        console.warn('MembersApiService: Unknown role:', role, 'normalized:', normalizedRole, 'defaulting to Member');
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
      
      switch (status) {
        case 401:
          return Result.failure(new Error('Unauthorized access'));
        case 400:
          const message = errorData?.detail || errorData?.error?.message || 'Invalid request';
          return Result.failure(new Error(message));
        case 409:
          return Result.failure(new Error('Email already exists'));
        case 500:
          return Result.failure(new Error('Server error - please try again later'));
        default:
          return Result.failure(new Error(`Network error (${status})`));
      }
    }
    
    return Result.failure(new Error('Network error - please check your connection'));
  }
}

// Export types for use in other modules
export type { Member };
export type { BackendMemberResponse };