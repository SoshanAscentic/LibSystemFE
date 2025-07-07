import { Result } from '../../shared/types/Result';
import { BusinessError, ValidationError } from '../../shared/types/errors';
import { Member, MemberStatistics } from '../entities/Member';
import { CreateMemberDto, UpdateMemberDto } from '../dtos/MemberDto';
import { MemberFilters, MemberSorting, MemberPagination } from '../valueObjects/MemberFilters';
import { IMemberRepository } from '../repositories/IMemberRepository';
import { MemberValidationService } from './MemberValidationService';

export class MemberService {
  constructor(
    private repository: IMemberRepository,
    private validationService: MemberValidationService
  ) {}

  async getAllMembers(
    filters?: MemberFilters,
    sorting?: MemberSorting,
    pagination?: MemberPagination
  ): Promise<Result<Member[], BusinessError>> {
    try {
      const result = await this.repository.findAll(filters, sorting, pagination);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to retrieve members', 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while fetching members', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async getMemberById(id: number): Promise<Result<Member | null, BusinessError>> {
    if (!id || id <= 0) {
      return Result.failure(
        new ValidationError('Member ID must be a positive number', 'id', id)
      );
    }

    try {
      const result = await this.repository.findById(id);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError(`Failed to retrieve member with ID ${id}`, 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while fetching member', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async createMember(data: CreateMemberDto): Promise<Result<Member, BusinessError>> {
    // Validate input
    const validation = this.validationService.validateCreateMember(data);
    if (!validation.isValid) {
      return Result.failure(
        new ValidationError(validation.errors.join(', '), 'member_data', data)
      );
    }

    try {
      // Business rule: Check for duplicate email
      const existingMembersResult = await this.repository.search(data.email);
      if (existingMembersResult.isSuccess) {
        const duplicateEmail = existingMembersResult.value.find(
          member => member.email.toLowerCase() === data.email.toLowerCase()
        );
        
        if (duplicateEmail) {
          return Result.failure(
            new BusinessError(
              `A member with email "${data.email}" already exists`,
              'DUPLICATE_EMAIL'
            )
          );
        }
      }

      const result = await this.repository.create(data);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to create member', 'CREATE_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while creating member', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async updateMember(id: number, data: UpdateMemberDto): Promise<Result<Member, BusinessError>> {
    if (!id || id <= 0) {
      return Result.failure(
        new ValidationError('Member ID must be a positive number', 'id', id)
      );
    }

    // Validate input
    const validation = this.validationService.validateCreateMember(data);
    if (!validation.isValid) {
      return Result.failure(
        new ValidationError(validation.errors.join(', '), 'member_data', data)
      );
    }

    try {
      // Check if member exists
      const existingMemberResult = await this.repository.findById(id);
      if (existingMemberResult.isFailure || !existingMemberResult.value) {
        return Result.failure(
          new BusinessError(`Member with ID ${id} not found`, 'NOT_FOUND')
        );
      }

      const result = await this.repository.update(id, data);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to update member', 'UPDATE_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while updating member', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async deleteMember(id: number): Promise<Result<void, BusinessError>> {
    console.log('👥 MemberService: Starting delete for member ID:', id);
    
    if (!id || id <= 0) {
      console.log('👥 MemberService: Invalid member ID');
      return Result.failure(
        new ValidationError('Member ID must be a positive number', 'id', id)
      );
    }

    try {
      // Check if member exists
      console.log('👥 MemberService: Checking if member exists...');
      const existingMemberResult = await this.repository.findById(id);
      console.log('👥 MemberService: Member exists check result:', existingMemberResult);
      
      if (existingMemberResult.isFailure) {
        console.log('👥 MemberService: Failed to check if member exists');
        return Result.failure(
          new BusinessError(`Failed to verify member with ID ${id}`, 'VERIFICATION_ERROR', existingMemberResult.error)
        );
      }
      
      if (!existingMemberResult.value) {
        console.log('👥 MemberService: Member not found');
        return Result.failure(
          new BusinessError(`Member with ID ${id} not found`, 'NOT_FOUND')
        );
      }

      // Business rule: Cannot delete members with active borrowings
      const member = existingMemberResult.value;
      console.log('👥 MemberService: Member borrowed books count:', member.borrowedBooksCount);
      
      if (member.borrowedBooksCount > 0) {
        console.log('👥 MemberService: Cannot delete member with active borrowings');
        return Result.failure(
          new BusinessError(
            'Cannot delete a member who currently has borrowed books',
            'MEMBER_HAS_ACTIVE_LOANS'
          )
        );
      }

      console.log('👥 MemberService: Calling repository delete...');
      const result = await this.repository.delete(id);
      console.log('👥 MemberService: Repository delete result:', result);
      
      if (result.isFailure) {
        console.error('👥 MemberService: Repository delete failed:', result.error);
        return Result.failure(
          new BusinessError('Failed to delete member', 'DELETE_ERROR', result.error)
        );
      }

      console.log('👥 MemberService: Delete successful');
      return Result.success(undefined);
    } catch (error) {
      console.error('👥 MemberService: Unexpected error during delete:', error);
      return Result.failure(
        new BusinessError('Unexpected error while deleting member', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async searchMembers(query: string, filters?: MemberFilters): Promise<Result<Member[], BusinessError>> {
    // Validate search query
    const validation = this.validationService.validateSearchQuery(query);
    if (!validation.isValid) {
      return Result.failure(
        new ValidationError(validation.errors.join(', '), 'search_query', query)
      );
    }

    // Business rule: Empty or short queries return empty results
    if (!query || query.trim().length < 2) {
      return Result.success([]);
    }

    try {
      const result = await this.repository.search(query.trim(), filters);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to search members', 'SEARCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while searching members', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async getMemberStatistics(id: number): Promise<Result<MemberStatistics, BusinessError>> {
    if (!id || id <= 0) {
      return Result.failure(
        new ValidationError('Member ID must be a positive number', 'id', id)
      );
    }

    try {
      const result = await this.repository.getMemberStatistics(id);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to get member statistics', 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while getting member statistics', 'UNKNOWN_ERROR', error)
      );
    }
  }

  async getMemberBorrowingHistory(id: number): Promise<Result<Member, BusinessError>> {
    if (!id || id <= 0) {
      return Result.failure(
        new ValidationError('Member ID must be a positive number', 'id', id)
      );
    }

    try {
      const result = await this.repository.getMemberBorrowingHistory(id);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to get member borrowing history', 'FETCH_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while getting member borrowing history', 'UNKNOWN_ERROR', error)
      );
    }
  }
}
