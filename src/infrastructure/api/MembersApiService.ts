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
   * Map backend response to domain Member entity - FIXED for role mapping and date parsing
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

      // FIXED: Better role mapping - prioritize explicit role field, then memberType
      const role = this.mapRoleFromString(backendData.role || backendData.memberType);
      const memberType = this.mapMemberTypeFromString(backendData.memberType);

      // FIXED: Better registration date parsing with validation
      let registrationDate: Date;
      if (backendData.registrationDate) {
        try {
          // Try to parse the date string
          const parsedDate = new Date(backendData.registrationDate);
          
          // Validate the parsed date
          if (isNaN(parsedDate.getTime())) {
            console.warn('MembersApiService: Invalid registration date format:', backendData.registrationDate);
            registrationDate = new Date(); // Fallback to current date
          } else {
            registrationDate = parsedDate;
          }
        } catch (error) {
          console.warn('MembersApiService: Error parsing registration date:', error);
          registrationDate = new Date(); // Fallback to current date
        }
      } else {
        console.warn('MembersApiService: No registration date provided');
        registrationDate = new Date(); // Fallback to current date
      }

      const member: Member = {
        memberId: backendData.memberID || 0,  // Note: backend uses "memberID"
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
        email: backendData.email || '',
        memberType: memberType,
        role: role,
        isActive: backendData.isActive !== false,
        registrationDate: registrationDate,
        borrowedBooksCount: backendData.borrowedBooksCount || 0,
        canBorrowBooks: backendData.canBorrowBooks !== false,
        canViewBooks: backendData.canViewBooks !== false,
        canViewMembers: backendData.canViewMembers !== false,
        canManageBooks: backendData.canManageBooks !== false,
        currentLoans: backendData.currentLoans || [],
        borrowingHistory: backendData.borrowingHistory || [],
      };

      console.log('MembersApiService: Mapped member:', {
        memberId: member.memberId,
        fullName: member.fullName,
        role: member.role,
        memberType: member.memberType,
        registrationDate: member.registrationDate.toISOString(),
        isValidDate: !isNaN(member.registrationDate.getTime())
      });
      
      return member;
    } catch (error) {
      console.error('MembersApiService: Member mapping error:', error);
      throw new Error(`Failed to map member: ${error}`);
    }
  }

  /**
   * Map member type string to enum - FIXED to handle Administrator
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
      case 'administrator':
      case 'admin':
        return MemberType.ADMINISTRATOR;
      default:
        console.warn('MembersApiService: Unknown member type:', memberType, 'normalized:', normalizedType);
        return MemberType.REGULAR_MEMBER;
    }
  }

  /**
   * Map role string to enum - FIXED to handle Administrator properly
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
        console.warn('MembersApiService: Unknown role:', role, 'normalized:', normalizedRole);
        // Don't default to Member - try to infer from memberType or return what we have
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