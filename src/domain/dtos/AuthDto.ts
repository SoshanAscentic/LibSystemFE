export interface LoginDto {
  readonly email: string;
  readonly password: string;
  readonly rememberMe: boolean;
}

export interface RegisterDto {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly memberType: number; // API expects number
}

export interface LoginResponseDto {
  readonly success: boolean;
  readonly data: {
    readonly user: {
      readonly userId: number;
      readonly firstName: string;
      readonly lastName: string;
      readonly email: string;
      readonly role: string;
      readonly memberType: string;
      readonly isActive: boolean;
      readonly registrationDate: string;
    };
    readonly token: string;
    readonly refreshToken?: string;
  };
  readonly message?: string;
}

export interface RefreshTokenDto {
  readonly refreshToken: string;
}