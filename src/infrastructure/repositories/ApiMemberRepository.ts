import { IMemberRepository } from '../../domain/repositories/IMemberRepository';
import { Member } from '../../domain/entities/Member';
import { Result } from '../../shared/types/Result';
import { MembersApiService, RegisterMemberDto } from '../api/MembersApiService';

export class ApiMemberRepository implements IMemberRepository {
  constructor(private membersApiService: MembersApiService) {}

  async findAll(): Promise<Result<Member[], Error>> {
    try {
      return await this.membersApiService.getAllMembers();
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while fetching members'));
    }
  }

  async findById(id: number): Promise<Result<Member | null, Error>> {
    try {
      return await this.membersApiService.getMemberById(id);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while fetching member'));
    }
  }

  async registerMember(data: RegisterMemberDto): Promise<Result<Member, Error>> {
    try {
      return await this.membersApiService.registerMember(data);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while registering member'));
    }
  }
}

// Export the DTO type
export type { RegisterMemberDto };