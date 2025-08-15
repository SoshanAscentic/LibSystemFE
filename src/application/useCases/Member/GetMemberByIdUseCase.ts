import { MemberService } from '../../../domain/services/Member/MemberService';
import { Member } from '../../../domain/entities/Member';
import { Result } from '../../../shared/types/Result';
import { BusinessError } from '../../../shared/types/errors';

export class GetMemberByIdUseCase {
  constructor(private memberService: MemberService) {}

  async execute(id: number): Promise<Result<Member | null, BusinessError>> {
    return await this.memberService.getMemberById(id);
  }
}