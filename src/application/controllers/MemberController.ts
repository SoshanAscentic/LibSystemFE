import { ControllerResult } from '../../shared/interfaces/common';
import { INavigationService, INotificationService } from '../../shared/interfaces/services';
import { MemberService } from '../../domain/services/MemberService';
import { Member } from '../../domain/entities/Member';
import { RegisterMemberDto } from '../../domain/dtos/MemberDto';

export class MembersController {
  constructor(
    private memberService: MemberService,
    private navigationService: INavigationService,
    private notificationService: INotificationService
  ) {}

  async handleGetAllMembers(): Promise<{ members: Member[]; success: boolean; error?: string }> {
    const result = await this.memberService.getAllMembers();

    if (result.isSuccess) {
      return {
        members: result.value,
        success: true
      };
    } else {
      this.notificationService.showError(
        'Failed to load members',
        result.error.message
      );
      return {
        members: [],
        success: false,
        error: result.error.message
      };
    }
  }

  async handleGetMemberById(id: number): Promise<{ member: Member | null; success: boolean; error?: string }> {
    const result = await this.memberService.getMemberById(id);

    if (result.isSuccess) {
      return {
        member: result.value,
        success: true
      };
    } else {
      this.notificationService.showError(
        'Failed to load member',
        result.error.message
      );
      return {
        member: null,
        success: false,
        error: result.error.message
      };
    }
  }

  async handleRegisterMember(data: RegisterMemberDto): Promise<ControllerResult> {
    const result = await this.memberService.registerMember(data);

    if (result.isSuccess) {
      this.notificationService.showSuccess(
        'Member registered successfully',
        `${result.value.fullName} has been added to the library`
      );
      
      // Navigate to the new member's detail page
      this.navigationService.navigateToMember(result.value.memberId);
      
      return ControllerResult.success(result.value);
    } else {
      this.notificationService.showError(
        'Failed to register member',
        result.error.message
      );
      
      return ControllerResult.failure(result.error.message);
    }
  }

  // Navigation helpers
  handleViewMember(member: Member): void {
    this.navigationService.navigateToMember(member.memberId);
  }

  handleNavigateToAddMember(): void {
    this.navigationService.navigateToMembers();
  }

  handleNavigateToMembers(): void {
    this.navigationService.navigateToMembers();
  }

  handleNavigateBack(): void {
    this.navigationService.goBack();
  }
}