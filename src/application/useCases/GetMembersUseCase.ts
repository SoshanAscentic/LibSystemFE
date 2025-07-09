import { MemberService } from '../../domain/services/MemberService';
import { Member } from '../../domain/entities/Member';
import { Result } from '../../shared/types/Result';
import { BusinessError } from '../../shared/types/errors';

export class GetMembersUseCase {
  constructor(private memberService: MemberService) {}

  async execute(): Promise<Result<Member[], BusinessError>> {
    return await this.memberService.getAllMembers();
  }
}