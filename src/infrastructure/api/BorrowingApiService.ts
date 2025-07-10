import { ApiClient, ApiResponse } from './ApiClient';
import { Result } from '../../shared/types/Result';
import { BorrowingRecord, BorrowingStatus, MemberBorrowingStatus, BorrowingStatistics } from '../../domain/entities/BorrowingRecord';
import { BorrowBookDto, ReturnBookDto, BorrowingFilters, BorrowingSorting, BorrowingPagination } from '../../domain/dtos/BorrowingDto';

// Backend response interfaces
interface BackendBorrowingResponse {
  borrowingId: number;
  bookId: number;
  memberId: number;
  bookTitle: string;
  bookAuthor: string;
  memberName: string;
  memberEmail: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  isReturned: boolean;
  isOverdue: boolean;
  daysBorrowed: number;
  daysOverdue: number;
  lateFee: number;
  status: string;
  [key: string]: any;
}

interface BackendMemberBorrowingStatusResponse {
  memberId: number;
  memberName: string;
  memberEmail: string;
  memberType: string;
  borrowedBooksCount: number;
  maxBooksAllowed: number;
  canBorrowBooks: boolean;
  canBorrowMoreBooks: boolean;
  currentBorrowings: BackendBorrowingResponse[];
  recentHistory: BackendBorrowingResponse[];
  overdueBorrowings: BackendBorrowingResponse[];
  totalLateFees: number;
  [key: string]: any;
}

interface BackendBorrowingStatisticsResponse {
  totalBorrowings: number;
  activeBorrowings: number;
  overdueBorrowings: number;
  totalReturned: number;
  averageBorrowingDuration: number;
  totalLateFees: number;
  [key: string]: any;
}

export class BorrowingApiService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Borrow a book
   */
  async borrowBook(data: BorrowBookDto): Promise<Result<BorrowingRecord, Error>> {
    try {
      console.log('BorrowingApiService: Borrowing book:', data);
      
      const response = await this.apiClient.post('/api/borrowing/borrow', data);
      
      console.log('BorrowingApiService: Borrow response:', response.data);
      
      if (response.data.success) {
        const backendData: BackendBorrowingResponse = response.data.data as BackendBorrowingResponse;
        const borrowingRecord = this.mapBackendResponseToBorrowingRecord(backendData);
        return Result.success(borrowingRecord);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to borrow book'));
      }
    } catch (error: any) {
      console.error('BorrowingApiService: Borrow book error:', error);
      return this.handleApiError(error, 'borrow book');
    }
  }

  /**
   * Return a book
   */
  async returnBook(data: ReturnBookDto): Promise<Result<BorrowingRecord, Error>> {
    try {
      console.log('BorrowingApiService: Returning book:', data);
      
      const response = await this.apiClient.post('/api/borrowing/return', data);
      
      console.log('BorrowingApiService: Return response:', response.data);
      
      if (response.data.success) {
        const backendData: BackendBorrowingResponse = response.data.data as BackendBorrowingResponse;
        const borrowingRecord = this.mapBackendResponseToBorrowingRecord(backendData);
        return Result.success(borrowingRecord);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to return book'));
      }
    } catch (error: any) {
      console.error('BorrowingApiService: Return book error:', error);
      return this.handleApiError(error, 'return book');
    }
  }

  /**
   * Get all borrowing records with optional filters
   */
  async getAllBorrowings(
    filters?: BorrowingFilters,
    sorting?: BorrowingSorting,
    pagination?: BorrowingPagination
  ): Promise<Result<BorrowingRecord[], Error>> {
    try {
      const params = {
        ...filters,
        ...sorting,
        ...pagination
      };

      const response = await this.apiClient.get('/api/borrowing', { params });
      
      if (response.data.success) {
        const backendData: BackendBorrowingResponse[] = response.data.data as BackendBorrowingResponse[];
        const borrowings = backendData.map(item => this.mapBackendResponseToBorrowingRecord(item));
        return Result.success(borrowings);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch borrowing records'));
      }
    } catch (error: any) {
      return this.handleApiError(error, 'get all borrowings');
    }
  }

  /**
   * Get borrowing record by ID
   */
  async getBorrowingById(id: number): Promise<Result<BorrowingRecord | null, Error>> {
    try {
      const response = await this.apiClient.get(`/api/borrowing/${id}`);
      
      if (response.data.success) {
        const backendData: BackendBorrowingResponse = response.data.data as BackendBorrowingResponse;
        
        if (!backendData) {
          return Result.success(null);
        }
        
        const borrowing = this.mapBackendResponseToBorrowingRecord(backendData);
        return Result.success(borrowing);
      } else {
        if (response.data.error?.code === 'NOT_FOUND') {
          return Result.success(null);
        }
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch borrowing record'));
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        return Result.success(null);
      }
      return this.handleApiError(error, 'get borrowing by ID');
    }
  }

  /**
   * Get member borrowing status
   */
  async getMemberBorrowingStatus(memberId: number): Promise<Result<MemberBorrowingStatus, Error>> {
    try {
      console.log('BorrowingApiService: Getting member borrowing status for member:', memberId);
      
      const response = await this.apiClient.get(`/api/borrowing/member/${memberId}`);
      
      console.log('BorrowingApiService: API response:', response.data);
      console.log('BorrowingApiService: Full response object:', response);
      
      if (response.data.success) {
        const backendData = response.data.data;
        
        
        const status = this.mapBackendResponseToMemberBorrowingStatus(backendData);
        console.log('BorrowingApiService: Mapped status:', status);
        console.log('BorrowingApiService: Current borrowings count:', status.currentBorrowings?.length || 0);
        
        return Result.success(status);
      } else {
        console.error('BorrowingApiService: API returned error:', response.data.error);
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch member borrowing status'));
      }
    } catch (error: any) {
      console.error('BorrowingApiService: Get member status error:', error);
      console.error('BorrowingApiService: Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      return this.handleApiError(error, 'get member borrowing status');
    }
  }

  /**
   * Map backend member borrowing status response to domain entity
   */
  private mapBackendResponseToMemberBorrowingStatus(backendData: any): MemberBorrowingStatus {
    try {
      if (!backendData) {
        throw new Error('Backend member borrowing status data is null or undefined');
      }

      console.log('BorrowingApiService: Mapping backend data:', backendData);
      console.log('BorrowingApiService: All backend data keys:', Object.keys(backendData));

      // Try different possible field names for current borrowings
      let currentBorrowingsData = backendData.currentBorrowings || 
                                 backendData.activeBorrowings || 
                                 backendData.borrowings || 
                                 backendData.currentLoans || 
                                 backendData.activeLoans || 
                                 [];

      console.log('BorrowingApiService: Current borrowings data:', currentBorrowingsData);
      console.log('BorrowingApiService: Current borrowings type:', typeof currentBorrowingsData);
      console.log('BorrowingApiService: Current borrowings length:', currentBorrowingsData?.length || 0);

      // Map current borrowings
      const currentBorrowings = Array.isArray(currentBorrowingsData) 
        ? currentBorrowingsData.map((item, index) => {
            console.log(`BorrowingApiService: Mapping borrowing ${index}:`, item);
            try {
              return this.mapBackendResponseToBorrowingRecord(item);
            } catch (error) {
              console.error(`BorrowingApiService: Error mapping borrowing ${index}:`, error);
              return null;
            }
          }).filter(item => item !== null)
        : [];

      console.log('BorrowingApiService: Mapped current borrowings:', currentBorrowings);

      // Try different possible field names for recent history
      let recentHistoryData = backendData.recentHistory || 
                             backendData.history || 
                             backendData.borrowingHistory || 
                             [];

      // Try different possible field names for overdue borrowings
      let overdueBorrowingsData = backendData.overdueBorrowings || 
                                 backendData.overdueBooks || 
                                 backendData.overdue || 
                                 [];

      const status: MemberBorrowingStatus = {
        memberId: backendData.memberId || backendData.memberID || 0,
        memberName: backendData.memberName || backendData.name || '',
        memberEmail: backendData.memberEmail || backendData.email || '',
        memberType: backendData.memberType || backendData.type || '',
        borrowedBooksCount: backendData.borrowedBooksCount || backendData.borrowedBooks || 0,
        maxBooksAllowed: backendData.maxBooksAllowed || backendData.maxBooks || 5,
        canBorrowBooks: backendData.canBorrowBooks ?? true,
        canBorrowMoreBooks: backendData.canBorrowMoreBooks ?? true,
        currentBorrowings: currentBorrowings,
        recentHistory: Array.isArray(recentHistoryData) 
          ? recentHistoryData.map(item => this.mapBackendResponseToBorrowingRecord(item)).filter(item => item !== null)
          : [],
        overdueBorrowings: Array.isArray(overdueBorrowingsData) 
          ? overdueBorrowingsData.map(item => this.mapBackendResponseToBorrowingRecord(item)).filter(item => item !== null)
          : [],
        totalLateFees: backendData.totalLateFees || backendData.lateFees || 0,
      };

      console.log('BorrowingApiService: Final mapped status:', status);
      console.log('BorrowingApiService: Final current borrowings count:', status.currentBorrowings.length);

      return status;
    } catch (error) {
      console.error('BorrowingApiService: Member status mapping error:', error);
      console.error('BorrowingApiService: Backend data that failed to map:', backendData);
      throw new Error(`Failed to map member borrowing status: ${error}`);
    }
  }

  /**
   * Map backend borrowing response to domain entity
   */
  private mapBackendResponseToBorrowingRecord(backendData: any): BorrowingRecord {
    try {
      if (!backendData) {
        console.warn('BorrowingApiService: Null/undefined borrowing data, skipping');
        return null;
      }

      console.log('BorrowingApiService: Mapping borrowing record:', backendData);
      console.log('BorrowingApiService: Borrowing record keys:', Object.keys(backendData));

      const borrowingRecord: BorrowingRecord = {
        borrowingId: backendData.borrowingId || backendData.id || backendData.borrowingID || 0,
        bookId: backendData.bookId || backendData.bookID || 0,
        memberId: backendData.memberId || backendData.memberID || 0,
        bookTitle: backendData.bookTitle || backendData.title || '',
        bookAuthor: backendData.bookAuthor || backendData.author || '',
        memberName: backendData.memberName || backendData.name || '',
        memberEmail: backendData.memberEmail || backendData.email || '',
        borrowedAt: new Date(backendData.borrowedAt || backendData.dateBorrowed || new Date()),
        dueDate: new Date(backendData.dueDate || backendData.dateDue || new Date()),
        returnedAt: backendData.returnedAt || backendData.dateReturned ? new Date(backendData.returnedAt || backendData.dateReturned) : undefined,
        isReturned: backendData.isReturned || backendData.returned || false,
        isOverdue: backendData.isOverdue || backendData.overdue || false,
        daysBorrowed: backendData.daysBorrowed || backendData.daysActive || 0,
        daysOverdue: backendData.daysOverdue || backendData.overduedays || 0,
        lateFee: backendData.lateFee || backendData.fee || 0,
        status: this.mapStatusFromString(backendData.status || 'Active'),
      };

      console.log('BorrowingApiService: Mapped borrowing record:', borrowingRecord);

      return borrowingRecord;
    } catch (error) {
      console.error('BorrowingApiService: Borrowing mapping error:', error);
      console.error('BorrowingApiService: Backend data that failed to map:', backendData);
      throw new Error(`Failed to map borrowing record: ${error}`);
    }
  }

  /**
   * Map backend statistics response to domain entity
   */
  private mapBackendResponseToBorrowingStatistics(backendData: BackendBorrowingStatisticsResponse): BorrowingStatistics {
    try {
      if (!backendData) {
        throw new Error('Backend borrowing statistics data is null or undefined');
      }

      const statistics: BorrowingStatistics = {
        totalBorrowings: backendData.totalBorrowings || 0,
        activeBorrowings: backendData.activeBorrowings || 0,
        overdueBorrowings: backendData.overdueBorrowings || 0,
        totalReturned: backendData.totalReturned || 0,
        averageBorrowingDuration: backendData.averageBorrowingDuration || 0,
        totalLateFees: backendData.totalLateFees || 0,
      };

      return statistics;
    } catch (error) {
      console.error('BorrowingApiService: Statistics mapping error:', error);
      throw new Error(`Failed to map borrowing statistics: ${error}`);
    }
  }

  /**
   * Map status string to enum
   */
  private mapStatusFromString(status: string): BorrowingStatus {
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '');
    
    switch (normalizedStatus) {
      case 'active':
        return BorrowingStatus.ACTIVE;
      case 'returned':
        return BorrowingStatus.RETURNED;
      case 'overdue':
        return BorrowingStatus.OVERDUE;
      default:
        console.warn('BorrowingApiService: Unknown status:', status);
        return BorrowingStatus.ACTIVE;
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleApiError(error: any, operation: string): Result<any, Error> {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      switch (status) {
        case 401:
          return Result.failure(new Error('Unauthorized access'));
        case 400:
          const message = errorData?.detail || errorData?.error?.message || 'Invalid request';
          return Result.failure(new Error(message));
        case 404:
          return Result.failure(new Error('Resource not found'));
        case 409:
          return Result.failure(new Error('Conflict - operation not allowed'));
        case 500:
          return Result.failure(new Error('Server error - please try again later'));
        default:
          return Result.failure(new Error(`Network error (${status})`));
      }
    }
    
    return Result.failure(new Error('Network error - please check your connection'));
  }
}