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
      console.log('BorrowingApiService: Getting member borrowing status for:', memberId);
      
      const response = await this.apiClient.get(`/api/borrowing/member/${memberId}`);
      
      console.log('BorrowingApiService: Member status response:', response.data);
      
      if (response.data.success) {
        const backendData: BackendMemberBorrowingStatusResponse = response.data.data as BackendMemberBorrowingStatusResponse;
        const status = this.mapBackendResponseToMemberBorrowingStatus(backendData);
        return Result.success(status);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch member borrowing status'));
      }
    } catch (error: any) {
      console.error('BorrowingApiService: Get member status error:', error);
      return this.handleApiError(error, 'get member borrowing status');
    }
  }

  /**
   * Get book borrowing history
   */
  async getBookBorrowingHistory(bookId: number): Promise<Result<BorrowingRecord[], Error>> {
    try {
      const response = await this.apiClient.get(`/api/borrowing/book/${bookId}`);
      
      if (response.data.success) {
        const backendData: BackendBorrowingResponse[] = response.data.data as BackendBorrowingResponse[];
        const history = backendData.map(item => this.mapBackendResponseToBorrowingRecord(item));
        return Result.success(history);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch book borrowing history'));
      }
    } catch (error: any) {
      return this.handleApiError(error, 'get book borrowing history');
    }
  }

  /**
   * Get overdue records
   */
  async getOverdueRecords(): Promise<Result<BorrowingRecord[], Error>> {
    try {
      const response = await this.apiClient.get('/api/borrowing/overdue');
      
      if (response.data.success) {
        const backendData: BackendBorrowingResponse[] = response.data.data as BackendBorrowingResponse[];
        const overdue = backendData.map(item => this.mapBackendResponseToBorrowingRecord(item));
        return Result.success(overdue);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch overdue records'));
      }
    } catch (error: any) {
      return this.handleApiError(error, 'get overdue records');
    }
  }

  /**
   * Get borrowing statistics
   */
  async getBorrowingStatistics(): Promise<Result<BorrowingStatistics, Error>> {
    try {
      const response = await this.apiClient.get('/api/borrowing/statistics');
      
      if (response.data.success) {
        const backendData: BackendBorrowingStatisticsResponse = response.data.data as BackendBorrowingStatisticsResponse;
        const statistics = this.mapBackendResponseToBorrowingStatistics(backendData);
        return Result.success(statistics);
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to fetch borrowing statistics'));
      }
    } catch (error: any) {
      return this.handleApiError(error, 'get borrowing statistics');
    }
  }

  /**
   * Map backend borrowing response to domain entity
   */
  private mapBackendResponseToBorrowingRecord(backendData: BackendBorrowingResponse): BorrowingRecord {
    try {
      if (!backendData) {
        throw new Error('Backend borrowing data is null or undefined');
      }

      const borrowingRecord: BorrowingRecord = {
        borrowingId: backendData.borrowingId || 0,
        bookId: backendData.bookId || 0,
        memberId: backendData.memberId || 0,
        bookTitle: backendData.bookTitle || '',
        bookAuthor: backendData.bookAuthor || '',
        memberName: backendData.memberName || '',
        memberEmail: backendData.memberEmail || '',
        borrowedAt: new Date(backendData.borrowedAt || new Date()),
        dueDate: new Date(backendData.dueDate || new Date()),
        returnedAt: backendData.returnedAt ? new Date(backendData.returnedAt) : undefined,
        isReturned: backendData.isReturned || false,
        isOverdue: backendData.isOverdue || false,
        daysBorrowed: backendData.daysBorrowed || 0,
        daysOverdue: backendData.daysOverdue || 0,
        lateFee: backendData.lateFee || 0,
        status: this.mapStatusFromString(backendData.status),
      };

      return borrowingRecord;
    } catch (error) {
      console.error('BorrowingApiService: Borrowing mapping error:', error);
      throw new Error(`Failed to map borrowing record: ${error}`);
    }
  }

  /**
   * Map backend member borrowing status response to domain entity
   */
  private mapBackendResponseToMemberBorrowingStatus(backendData: BackendMemberBorrowingStatusResponse): MemberBorrowingStatus {
    try {
      if (!backendData) {
        throw new Error('Backend member borrowing status data is null or undefined');
      }

      const status: MemberBorrowingStatus = {
        memberId: backendData.memberId || 0,
        memberName: backendData.memberName || '',
        memberEmail: backendData.memberEmail || '',
        memberType: backendData.memberType || '',
        borrowedBooksCount: backendData.borrowedBooksCount || 0,
        maxBooksAllowed: backendData.maxBooksAllowed || 0,
        canBorrowBooks: backendData.canBorrowBooks || false,
        canBorrowMoreBooks: backendData.canBorrowMoreBooks || false,
        currentBorrowings: (backendData.currentBorrowings || []).map(item => 
          this.mapBackendResponseToBorrowingRecord(item)
        ),
        recentHistory: (backendData.recentHistory || []).map(item => 
          this.mapBackendResponseToBorrowingRecord(item)
        ),
        overdueBorrowings: (backendData.overdueBorrowings || []).map(item => 
          this.mapBackendResponseToBorrowingRecord(item)
        ),
        totalLateFees: backendData.totalLateFees || 0,
      };

      return status;
    } catch (error) {
      console.error('BorrowingApiService: Member status mapping error:', error);
      throw new Error(`Failed to map member borrowing status: ${error}`);
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