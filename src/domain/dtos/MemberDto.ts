export interface RegisterMemberDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly memberType: number; // 0=RegularMember, 1=MinorStaff, 2=ManagementStaff
}