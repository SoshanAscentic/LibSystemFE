//src/application/controllers/MembersController.ts
import { ControllerResult } from '../../shared/interfaces/common';
import { INavigationService, INotificationService } from '../../shared/interfaces/services';
import { MemberService } from '../../domain/services/MemberService';
import { Member } from '../../domain/entities/Member';
import { CreateMemberDto, UpdateMemberDto } from '../../domain/dtos/MemberDto';
import { MemberFilters, MemberSorting, MemberPagination } from '../../domain/valueObjects/MemberFilters';

export class MembersController {
  constructor(
    private memberService: MemberService,
    private navigationService: INavigationService,
    private notificationService: INotificationService
  ) {}

  async handleGetAllMembers(
    filters?: MemberFilters,
    sorting?: MemberSorting,
    pagination?: MemberPagination
  ): Promise<{ members: Member[]; success: boolean; error?: string }> {
    const result = await this.memberService.getAllMembers(filters, sorting, pagination);

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

  async handleCreateMember(data: CreateMemberDto): Promise<ControllerResult> {
    const result = await this.memberService.createMember(data);

    if (result.isSuccess) {
      this.notificationService.showSuccess(
        'Member created successfully',
        `${result.value.fullName} has been added to the library`
      );
      
      // Navigate to the new member's detail page
      this.navigationService.navigateToMember(result.value.memberId);
      
      return ControllerResult.success(result.value);
    } else {
      this.notificationService.showError(
        'Failed to create member',
        result.error.message
      );
      
      return ControllerResult.failure(result.error.message);
    }
  }

  async handleUpdateMember(id: number, data: UpdateMemberDto): Promise<ControllerResult> {
    const result = await this.memberService.updateMember(id, data);

    if (result.isSuccess) {
      this.notificationService.showSuccess(
        'Member updated successfully',
        `${result.value.fullName}'s information has been updated`
      );
      
      return ControllerResult.success(result.value);
    } else {
      this.notificationService.showError(
        'Failed to update member',
        result.error.message
      );
      
      return ControllerResult.failure(result.error.message);
    }
  }

  async handleDeleteMember(member: Member): Promise<ControllerResult> {
    const result = await this.memberService.deleteMember(member.memberId);

    if (result.isSuccess) {
      this.notificationService.showSuccess(
        'Member deleted successfully',
        `${member.fullName} has been removed from the library`
      );
      
      return ControllerResult.success();
    } else {
      this.notificationService.showError(
        'Failed to delete member',
        result.error.message
      );
      
      return ControllerResult.failure(result.error.message);
    }
  }

  async handleSearchMembers(query: string, filters?: MemberFilters): Promise<{ members: Member[]; success: boolean; error?: string }> {
    const result = await this.memberService.searchMembers(query, filters);

    if (result.isSuccess) {
      return {
        members: result.value,
        success: true
      };
    } else {
      // For search errors, we might not want to show notifications
      // as they can be noisy while user is typing
      return {
        members: [],
        success: false,
        error: result.error.message
      };
    }
  }

  // Navigation helpers
  handleViewMember(member: Member): void {
    this.navigationService.navigateToMember(member.memberId);
  }

  handleNavigateToAddMember(): void {
    this.navigationService.navigateToMembers();
    // The specific routing to /members/add will be handled by the navigation service
  }

  handleNavigateToMembers(): void {
    this.navigationService.navigateToMembers();
  }

  handleNavigateBack(): void {
    this.navigationService.goBack();
  }
}