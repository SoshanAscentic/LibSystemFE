import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { LoginDto, RegisterDto, LoginResponseDto, RefreshTokenDto } from '../../domain/dtos/AuthDto';
import { User, UserRole, MemberType } from '../../domain/entities/User';
import { Result } from '../../shared/types/Result';
import { ApiClient } from '../api/ApiClient';

export class ApiAuthRepository implements IAuthRepository {
  constructor(private apiClient: ApiClient) {}

  async login(credentials: LoginDto): Promise<Result<LoginResponseDto, Error>> {
    try {
      const response = await this.apiClient.post<LoginResponseDto['data']>('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.data.success) {
        const loginResponse: LoginResponseDto = {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
        return Result.success(loginResponse);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Login failed'));
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return Result.failure(new Error('Invalid credentials'));
      }
      return Result.failure(new Error(error.message || 'Network error during login'));
    }
  }

  async register(userData: RegisterDto): Promise<Result<User, Error>> {
    try {
      const response = await this.apiClient.post<any>('/api/auth/register', {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        memberType: userData.memberType
      });
      
      if (response.data.success) {
        const user = this.mapToUser(response.data.data);
        return Result.success(user);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Registration failed'));
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data?.error?.validationErrors;
        if (validationErrors) {
          const messages = Object.values(validationErrors).flat();
          return Result.failure(new Error(messages.join(', ')));
        }
      }
      return Result.failure(new Error(error.message || 'Network error during registration'));
    }
  }

  async refreshToken(refreshToken: RefreshTokenDto): Promise<Result<LoginResponseDto, Error>> {
    try {
      const response = await this.apiClient.post<LoginResponseDto['data']>('/api/auth/refresh', refreshToken);
      
      if (response.data.success) {
        const loginResponse: LoginResponseDto = {
          success: true,
          data: response.data.data
        };
        return Result.success(loginResponse);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Token refresh failed'));
      }
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error during token refresh'));
    }
  }

  async getCurrentUser(): Promise<Result<User, Error>> {
    try {
      const response = await this.apiClient.get<any>('/api/auth/me');
      
      if (response.data.success) {
        const user = this.mapToUser(response.data.data);
        return Result.success(user);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to get current user'));
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return Result.failure(new Error('Unauthorized'));
      }
      return Result.failure(new Error(error.message || 'Network error while getting current user'));
    }
  }

  async logout(): Promise<Result<void, Error>> {
    try {
      const response = await this.apiClient.post<void>('/api/auth/logout');
      
      if (response.data.success) {
        return Result.success(undefined);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Logout failed'));
      }
    } catch (error: any) {
      // Even if logout fails on server, we consider it successful for client
      return Result.success(undefined);
    }
  }

  private mapToUser(dto: any): User {
    return {
      userId: dto.userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      role: dto.role as UserRole,
      memberType: dto.memberType as MemberType,
      isActive: dto.isActive,
      registrationDate: new Date(dto.registrationDate)
    };
  }
}