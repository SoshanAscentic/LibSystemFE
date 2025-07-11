import { Result } from '../../shared/types/Result';
import { LoginDto, RegisterDto, LoginResponseDto, RefreshTokenDto } from '../dtos/AuthDto';
import { User } from '../entities/User';

export interface IAuthRepository {
  login(credentials: LoginDto): Promise<Result<LoginResponseDto, Error>>;
  register(userData: RegisterDto): Promise<Result<User, Error>>;
  refreshToken(refreshToken: RefreshTokenDto): Promise<Result<LoginResponseDto, Error>>;
  getCurrentUser(): Promise<Result<User, Error>>;
  logout(): Promise<Result<void, Error>>;
}
