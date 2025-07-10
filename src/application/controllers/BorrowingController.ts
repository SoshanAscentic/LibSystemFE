import { ControllerResult } from '../../shared/interfaces/common';
import { INavigationService, INotificationService } from '../../shared/interfaces/services';
import { BorrowingRecord, MemberBorrowingStatus } from '../../domain/entities/BorrowingRecord';
import { BorrowBookDto, ReturnBookDto } from '../../domain/dtos/BorrowingDto';
import { BorrowingService } from '../../domain/services/BorrowingService';

export class BorrowingController {
  constructor(
    private borrowingService: BorrowingService,
    private navigationService: INavigationService,
    private notificationService: INotificationService
  ) {}

  async handleBorrowBook(data: BorrowBookDto): Promise<ControllerResult> {
    try {
      console.log('BorrowingController: Starting borrow book process:', data);
      
      const result = await this.borrowingService.borrowBook(data);
      
      if (result.isSuccess) {
        console.log('BorrowingController: Book borrowed successfully:', result.value);
        
        this.notificationService.showSuccess(
          'Book Borrowed Successfully',
          `"${result.value.bookTitle}" has been borrowed and is due on ${new Date(result.value.dueDate).toLocaleDateString()}`
        );
        
        return ControllerResult.success(result.value);
      } else {
        console.error('BorrowingController: Borrow failed:', result.error);
        
        const errorMessage = this.getErrorMessage(result.error.message);
        this.notificationService.showError(
          'Failed to Borrow Book',
          errorMessage
        );
        
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      console.error('BorrowingController: Unexpected error during borrow:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      this.notificationService.showError(
        'Failed to Borrow Book',
        errorMessage
      );
      
      return ControllerResult.failure(errorMessage);
    }
  }

  async handleReturnBook(data: ReturnBookDto): Promise<ControllerResult> {
    try {
      console.log('BorrowingController: Starting return book process:', data);
      
      const result = await this.borrowingService.returnBook(data);
      
      if (result.isSuccess) {
        console.log('BorrowingController: Book returned successfully:', result.value);
        
        const lateFeeMessage = result.value.lateFee > 0 
          ? ` A late fee of $${result.value.lateFee.toFixed(2)} has been applied.`
          : '';
        
        this.notificationService.showSuccess(
          'Book Returned Successfully',
          `"${result.value.bookTitle}" has been returned.${lateFeeMessage}`
        );
        
        return ControllerResult.success(result.value);
      } else {
        console.error('BorrowingController: Return failed:', result.error);
        
        const errorMessage = this.getErrorMessage(result.error.message);
        this.notificationService.showError(
          'Failed to Return Book',
          errorMessage
        );
        
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      console.error('BorrowingController: Unexpected error during return:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      this.notificationService.showError(
        'Failed to Return Book',
        errorMessage
      );
      
      return ControllerResult.failure(errorMessage);
    }
  }

  async handleGetMemberBorrowingStatus(memberId: number): Promise<{ status: MemberBorrowingStatus | null; success: boolean; error?: string }> {
    try {
      console.log('BorrowingController: Getting member borrowing status for member:', memberId);
      
      const result = await this.borrowingService.getMemberBorrowingStatus(memberId);
      
      console.log('BorrowingController: Service result:', result);

      if (result.isSuccess) {
        console.log('BorrowingController: Successfully retrieved member status');
        console.log('BorrowingController: Current borrowings:', result.value.currentBorrowings?.length || 0);
        console.log('BorrowingController: Member details:', {
          memberId: result.value.memberId,
          memberName: result.value.memberName,
          borrowedBooksCount: result.value.borrowedBooksCount,
          canBorrowBooks: result.value.canBorrowBooks
        });
        
        return {
          status: result.value,
          success: true
        };
      } else {
        console.error('BorrowingController: Service returned failure:', result.error);
        return {
          status: null,
          success: false,
          error: result.error.message
        };
      }
    } catch (error: any) {
      console.error('BorrowingController: Unexpected error in handleGetMemberBorrowingStatus:', error);
      return {
        status: null,
        success: false,
        error: 'An unexpected error occurred while loading member borrowing status.'
      };
    }
  }

  // Navigation helpers - updated to remove dashboard
  handleNavigateToBorrowBook(): void {
    this.navigationService.navigateToBorrowBook();
  }

  handleNavigateToReturnBook(): void {
    this.navigationService.navigateToReturnBook();
  }

  handleNavigateBack(): void {
    this.navigationService.goBack();
  }

  /**
   * Map API error messages to user-friendly messages
   */
  private getErrorMessage(apiErrorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Book not available': 'This book is currently not available for borrowing.',
      'Book already borrowed': 'This book has already been borrowed by another member.',
      'Member borrowing limit exceeded': 'This member has reached their borrowing limit.',
      'Member has overdue books': 'This member has overdue books and cannot borrow more until they are returned.',
      'Book not found': 'The specified book could not be found.',
      'Member not found': 'The specified member could not be found.',
      'Borrowing record not found': 'The borrowing record could not be found.',
      'Book not borrowed by member': 'This book is not currently borrowed by the specified member.',
      'Book already returned': 'This book has already been returned.',
      'Invalid due date': 'The due date is invalid or in the past.',
      'Member account inactive': 'This member account is inactive and cannot borrow books.',
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