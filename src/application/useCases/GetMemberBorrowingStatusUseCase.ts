import { BorrowingService } from '../../domain/services/BorrowingService';
import { MemberBorrowingStatus } from '../../domain/entities/BorrowingRecord';
import { Result } from '../../shared/types/Result';
import { BusinessError } from '../../shared/types/errors';

export class GetMemberBorrowingStatusUseCase {
  constructor(private borrowingService: BorrowingService) {}

  async execute(memberId: number): Promise<Result<MemberBorrowingStatus, BusinessError>> {
    return await this.borrowingService.getMemberBorrowingStatus(memberId);
  }
}