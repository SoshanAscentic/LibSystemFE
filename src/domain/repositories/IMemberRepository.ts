import { Result } from '../../shared/types/Result';
import { Member } from '../entities/Member';
import { RegisterMemberDto } from '../../infrastructure/api/MembersApiService';

export interface IMemberRepository {
  findAll(): Promise<Result<Member[], Error>>;
  findById(id: number): Promise<Result<Member | null, Error>>;
  registerMember(data: RegisterMemberDto): Promise<Result<Member, Error>>;
}