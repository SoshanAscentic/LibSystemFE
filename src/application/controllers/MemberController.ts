import { ControllerResult } from '../../shared/interfaces/common';
import { INavigationService, INotificationService } from '../../shared/interfaces/services';
import { Member } from '../../domain/entities/Member';
import { RegisterMemberDto } from '../../domain/dtos/MemberDto';

// Import Use Cases
import { GetMembersUseCase } from '../useCases/Member/GetMembersUseCase';
import { GetMemberByIdUseCase } from '../useCases/Member/GetMemberByIdUseCase';
import { RegisterMemberUseCase } from '../useCases/Member/RegisterMemberUseCase';
import { MemberFilters } from '@/domain/valueObjects/MemberFilters';

export class MembersController {
  constructor(
    private getMembersUseCase: GetMembersUseCase,
    private getMemberUseCase: GetMemberByIdUseCase,
    private registerMemberUseCase: RegisterMemberUseCase,
    private navigationService: INavigationService,
    private notificationService: INotificationService
  ) {}

  async handleGetAllMembers(filters: MemberFilters | undefined): Promise<{ members: Member[]; success: boolean; error?: string }> {
    try {
      const result = await this.getMembersUseCase.execute();

      if (result.isSuccess) {
        return {
          members: result.value,
          success: true
        };
      } else {
        const errorMessage = this.getErrorMessage(result.error.message);
        this.notificationService.showError(
          'Failed to load members',
          errorMessage
        );
        
        return {
          members: [],
          success: false,
          error: result.error.message
        };
      }
    } catch (error: any) {
      const errorMessage = 'An unexpected error occurred while loading members.';
      this.notificationService.showError(
        'Failed to load members',
        errorMessage
      );
      
      return {
        members: [],
        success: false,
        error: errorMessage
      };
    }
  }

  async handleGetMemberById(id: number): Promise<{ member: Member | null; success: boolean; error?: string }> {
    try {
      const result = await this.getMemberUseCase.execute(id);

      if (result.isSuccess) {
        return {
          member: result.value,
          success: true
        };
      } else {
        const errorMessage = this.getErrorMessage(result.error.message);
        this.notificationService.showError(
          'Failed to load member',
          errorMessage
        );
        
        return {
          member: null,
          success: false,
          error: result.error.message
        };
      }
    } catch (error: any) {
      const errorMessage = 'An unexpected error occurred while loading the member.';
      this.notificationService.showError(
        'Failed to load member',
        errorMessage
      );
      
      return {
        member: null,
        success: false,
        error: errorMessage
      };
    }
  }

  async handleRegisterMember(data: RegisterMemberDto): Promise<ControllerResult> {
    try {
      const result = await this.registerMemberUseCase.execute(data);

      if (result.isSuccess) {
        this.notificationService.showSuccess(
          'Member registered successfully',
          `${result.value.fullName} has been added to the library`
        );
        
        // Navigate to the new member's detail page
        this.navigationService.navigateToMember(result.value.memberId);
        
        return ControllerResult.success(result.value);
      } else {
        const errorMessage = this.getErrorMessage(result.error.message);
        this.notificationService.showError(
          'Registration Failed',
          errorMessage
        );
        
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      const errorMessage = 'An unexpected error occurred during registration.';
      this.notificationService.showError(
        'Registration Failed',
        errorMessage
      );
      
      return ControllerResult.failure(errorMessage);
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

  /**
   * Map API error messages to user-friendly messages
   */
  private getErrorMessage(apiErrorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Email already exists': 'An account with this email already exists.',
      'Invalid email format': 'Please enter a valid email address.',
      'Password too weak': 'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
      'User not found': 'Member not found.',
      'Invalid member type': 'Please select a valid member type.',
      'Network error': 'Unable to connect to the server. Please check your internet connection.',
      'Server error': 'Server error occurred. Please try again later.',
      'Unauthorized': 'You do not have permission to perform this action.',
      'Forbidden': 'Access denied. Insufficient permissions.',
    };

    // Check for specific error patterns
    for (const [key, value] of Object.entries(errorMap)) {
      if (apiErrorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Return original message if no mapping found
    return apiErrorMessage || 'An error occurred. Please try again.';
  }
}
