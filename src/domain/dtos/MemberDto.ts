export interface CreateMemberDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly memberType: number; // API expects number: 0=RegularMember, 1=MinorStaff, 2=ManagementStaff
  readonly password?: string; // Optional for member creation
}

export interface UpdateMemberDto extends CreateMemberDto {
  readonly memberId: number;
  readonly isActive: boolean;
}

export interface MemberFiltersDto {
  readonly search?: string;
  readonly memberType?: MemberType;
  readonly isActive?: boolean;
  readonly hasBorrowedBooks?: boolean;
  readonly isOverdue?: boolean;
  readonly pageNumber?: number;
  readonly pageSize?: number;
  readonly sortBy?: 'firstName' | 'lastName' | 'email' | 'registrationDate' | 'borrowedBooksCount';
  readonly sortDirection?: 'asc' | 'desc';
}