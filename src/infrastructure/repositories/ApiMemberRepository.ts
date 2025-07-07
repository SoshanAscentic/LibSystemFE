import { IMemberRepository } from '../../domain/repositories/IMemberRepository';
import { Member, MemberStatistics } from '../../domain/entities/Member';
import { CreateMemberDto, UpdateMemberDto } from '../../domain/dtos/MemberDto';
import { MemberFilters, MemberSorting, MemberPagination } from '../../domain/valueObjects/MemberFilters';
import { Result } from '../../shared/types/Result';
import { MembersApiService } from '../api/MembersApiService';

export class ApiMemberRepository implements IMemberRepository {
  constructor(private membersApiService: MembersApiService) {}

  async findAll(
    filters?: MemberFilters,
    sorting?: MemberSorting,
    pagination?: MemberPagination
  ): Promise<Result<Member[], Error>> {
    try {
      const apiFilters = {
        ...filters,
        ...sorting,
        ...pagination
      };

      return await this.membersApiService.getAllMembers(apiFilters);
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

  async search(query: string, filters?: MemberFilters): Promise<Result<Member[], Error>> {
    try {
      return await this.membersApiService.searchMembers(query, filters);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while searching members'));
    }
  }

  async create(data: CreateMemberDto): Promise<Result<Member, Error>> {
    try {
      return await this.membersApiService.createMember(data);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while creating member'));
    }
  }

  async update(id: number, data: UpdateMemberDto): Promise<Result<Member, Error>> {
    try {
      return await this.membersApiService.updateMember(id, data);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while updating member'));
    }
  }

  async delete(id: number): Promise<Result<void, Error>> {
    try {
      return await this.membersApiService.deleteMember(id);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while deleting member'));
    }
  }

  async getMemberStatistics(id: number): Promise<Result<MemberStatistics, Error>> {
    try {
      return await this.membersApiService.getMemberStatistics(id);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while getting member statistics'));
    }
  }

  async getMemberBorrowingHistory(id: number): Promise<Result<Member, Error>> {
    try {
      return await this.membersApiService.getMemberBorrowingHistory(id);
    } catch (error: any) {
      return Result.failure(new Error(error.message || 'Network error while getting member borrowing history'));
    }
  }
}