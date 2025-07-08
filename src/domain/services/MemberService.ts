import { Result } from '../../shared/types/Result';
import { BusinessError, ValidationError } from '../../shared/types/errors';
import { Member } from '../entities/Member';
import { RegisterMemberDto } from '../dtos/MemberDto';
import { IMemberRepository } from '../repositories/IMemberRepository';
import { MemberValidationService } from './MemberValidationService';

export class MemberService {
  constructor(
    private repository: IMemberRepository,
    private validationService: MemberValidationService
  ) {}

  async getAllMembers(): Promise<Result<Member[], BusinessError>> {
    try {
      const result = await this.repository.findAll();
      
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

  async registerMember(data: RegisterMemberDto): Promise<Result<Member, BusinessError>> {
    // Validate input
    const validation = this.validationService.validateRegisterMember(data);
    if (!validation.isValid) {
      return Result.failure(
        new ValidationError(validation.errors.join(', '), 'member_data', data)
      );
    }

    try {
      const result = await this.repository.registerMember(data);
      
      if (result.isFailure) {
        return Result.failure(
          new BusinessError('Failed to register member', 'REGISTER_ERROR', result.error)
        );
      }

      return Result.success(result.value);
    } catch (error) {
      return Result.failure(
        new BusinessError('Unexpected error while registering member', 'UNKNOWN_ERROR', error)
      );
    }
  }
}