import { Result } from '../../shared/types/Result';
import { Member, MemberStatistics } from '../entities/Member';
import { CreateMemberDto, UpdateMemberDto } from '../dtos/MemberDto';
import { MemberFilters, MemberSorting, MemberPagination } from '../valueObjects/MemberFilter';

export interface IMemberRepository {
  findAll(
    filters?: MemberFilters,
    sorting?: MemberSorting,
    pagination?: MemberPagination
  ): Promise<Result<Member[], Error>>;
  
  findById(id: number): Promise<Result<Member | null, Error>>;
  
  search(
    query: string,
    filters?: MemberFilters
  ): Promise<Result<Member[], Error>>;
  
  create(data: CreateMemberDto): Promise<Result<Member, Error>>;
  
  update(id: number, data: UpdateMemberDto): Promise<Result<Member, Error>>;
  
  delete(id: number): Promise<Result<void, Error>>;
  
  getMemberStatistics(id: number): Promise<Result<MemberStatistics, Error>>;
  
  getMemberBorrowingHistory(id: number): Promise<Result<Member, Error>>;
}