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
 * Map backend response to domain Member entity - FIXED for memberType number handling
 */
private mapBackendResponseToMember(backendData: BackendMemberResponse): Member {
  try {
    if (!backendData) {
      throw new Error('Backend member data is null or undefined');
    }

    console.log('MembersApiService: Mapping backend data:', backendData);
    console.log('MembersApiService: memberType type:', typeof backendData.memberType, 'value:', backendData.memberType);

    // Parse the single "name" field into firstName and lastName
    const fullName = backendData.name || '';
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // FIXED: Handle memberType as either number or string
    let memberTypeString: string;
    let roleString: string;

    // Convert memberType number to string if needed
    if (typeof backendData.memberType === 'number') {
      console.log('MembersApiService: Converting memberType number to string:', backendData.memberType);
      memberTypeString = this.getMemberTypeFromNumber(backendData.memberType);
    } else {
      memberTypeString = backendData.memberType || 'RegularMember';
    }

    // Handle role field - prioritize explicit role, then use converted memberType
    if (backendData.role) {
      if (typeof backendData.role === 'number') {
        roleString = this.getMemberTypeFromNumber(backendData.role);
      } else {
        roleString = backendData.role;
      }
    } else {
      roleString = memberTypeString;
    }

    console.log('MembersApiService: Final strings - memberType:', memberTypeString, 'role:', roleString);

    const role = this.mapRoleFromString(roleString);
    const memberType = this.mapMemberTypeFromString(memberTypeString);

    // FIXED: Better registration date parsing with validation
    let registrationDate: Date;
    if (backendData.registrationDate) {
      try {
        const parsedDate = new Date(backendData.registrationDate);
        if (isNaN(parsedDate.getTime())) {
          console.warn('MembersApiService: Invalid registration date format:', backendData.registrationDate);
          registrationDate = new Date();
        } else {
          registrationDate = parsedDate;
        }
      } catch (error) {
        console.warn('MembersApiService: Error parsing registration date:', error);
        registrationDate = new Date();
      }
    } else {
      console.warn('MembersApiService: No registration date provided');
      registrationDate = new Date();
    }

    const member: Member = {
      memberId: backendData.memberID || 0,
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

    console.log('MembersApiService: Mapped member with types:', {
      memberId: member.memberId,
      fullName: member.fullName,
      role: member.role,
      memberType: member.memberType,
      registrationDate: member.registrationDate.toISOString(),
    });
    
    return member;
  } catch (error) {
    console.error('MembersApiService: Member mapping error:', error);
    throw new Error(`Failed to map member: ${error}`);
  }
}

/**
 * NEW: Convert memberType number to string
 */
private getMemberTypeFromNumber(memberType: number): string {
  const types = {
    0: 'RegularMember',
    1: 'MinorStaff', 
    2: 'ManagementStaff',
    3: 'Administrator'
  };
  const result = types[memberType as keyof typeof types] || 'RegularMember';
  console.log('MembersApiService: getMemberTypeFromNumber:', memberType, '->', result);
  return result;
}

/**
 * UPDATED: Map member type string to enum with better error handling
 */
private mapMemberTypeFromString(memberType: string): MemberType {
  if (!memberType) {
    console.warn('MembersApiService: Empty memberType, defaulting to REGULAR_MEMBER');
    return MemberType.REGULAR_MEMBER;
  }

  const normalizedType = memberType.toString().toLowerCase().replace(/\s+/g, '');
  console.log('MembersApiService: mapMemberTypeFromString input:', memberType, 'normalized:', normalizedType);
  
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
      console.warn('MembersApiService: Unknown member type:', memberType, 'normalized:', normalizedType, 'defaulting to REGULAR_MEMBER');
      return MemberType.REGULAR_MEMBER;
  }
}

/**
 * UPDATED: Map role string to enum with better error handling
 */
private mapRoleFromString(role: string): UserRole {
  if (!role) {
    console.warn('MembersApiService: Empty role, defaulting to MEMBER');
    return UserRole.MEMBER;
  }

  const normalizedRole = role.toString().toLowerCase().replace(/\s+/g, '');
  console.log('MembersApiService: mapRoleFromString input:', role, 'normalized:', normalizedRole);
  
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
      console.warn('MembersApiService: Unknown role:', role, 'normalized:', normalizedRole, 'defaulting to MEMBER');
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