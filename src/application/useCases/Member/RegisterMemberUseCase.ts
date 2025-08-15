import { MemberService } from '../../../domain/services/Member/MemberService';
import { Member } from '../../../domain/entities/Member';
import { RegisterMemberDto } from '../../../domain/dtos/MemberDto';
import { Result } from '../../../shared/types/Result';
import { BusinessError } from '../../../shared/types/errors';

export class RegisterMemberUseCase {
  constructor(private memberService: MemberService) {}

  async execute(data: RegisterMemberDto): Promise<Result<Member, BusinessError>> {
    return await this.memberService.registerMember(data);
  }
}