export interface User {
  readonly userId: number;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly role: UserRole;
  readonly memberType: MemberType;
  readonly isActive: boolean;
  readonly registrationDate: Date;
}

export enum UserRole {
  MEMBER = 'Member',
  MINOR_STAFF = 'MinorStaff', 
  MANAGEMENT_STAFF = 'ManagementStaff',
  ADMINISTRATOR = 'Administrator'
}

export enum MemberType {
  REGULAR_MEMBER = 'RegularMember',
  MINOR_STAFF = 'MinorStaff',
  MANAGEMENT_STAFF = 'ManagementStaff'
}

export interface AuthUser {
  readonly user: User;
  readonly token: string;
  readonly refreshToken?: string;
  readonly permissions: Permission[];
}

export interface Permission {
  readonly resource: 'books' | 'members' | 'borrowing' | 'users';
  readonly actions: ('create' | 'read' | 'update' | 'delete' | 'borrow')[];
}