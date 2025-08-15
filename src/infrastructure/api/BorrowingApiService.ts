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
   * Return a book - FIXED to use backend's expected format
   */
  async returnBook(data: ReturnBookDto): Promise<Result<BorrowingRecord, Error>> {
    try {
      console.log('BorrowingApiService: Starting return process with data:', data);
      console.log('BorrowingApiService: ReturnBookDto details:', {
        borrowingId: data.borrowingId,
        returnDate: data.returnDate,
        condition: data.condition,
        notes: data.notes
      });
      
      let bookId = 0;
      let memberId = 0;
      
      // Extract bookId and memberId from synthetic borrowingId
      if (data.borrowingId > 10000) {
        // Extract from synthetic ID (format: bookId * 10000 + memberId)
        bookId = Math.floor(data.borrowingId / 10000);
        memberId = data.borrowingId % 10000;
        
        console.log('BorrowingApiService: Extracted from synthetic borrowingId:', {
          original: data.borrowingId,
          bookId,
          memberId
        });
      } else if (data.borrowingId === 0) {
        console.error('BorrowingApiService: ERROR - Received borrowingId = 0!');
        console.error('BorrowingApiService: This means the frontend mapping failed');
        return Result.failure(new Error('Invalid borrowing ID: cannot return book without valid borrowing information'));
      } else {
        console.error('BorrowingApiService: Received unexpected borrowingId format:', data.borrowingId);
        return Result.failure(new Error('Cannot process this borrowing ID format'));
      }
      
      // Validate that we have valid IDs
      if (bookId <= 0 || memberId <= 0) {
        console.error('BorrowingApiService: Invalid extracted IDs:', { bookId, memberId });
        return Result.failure(new Error('Invalid book or member ID extracted from borrowing information'));
      }
      
      // Prepare the request in the format your backend expects
      const returnRequest = {
        BookId: bookId,        // Note: Capital B (backend expects this format)
        MemberID: memberId,    // Note: Capital M and ID (backend expects this format)
        ReturnDate: data.returnDate,
        Condition: data.condition,
        Notes: data.notes
      };
      
      console.log('BorrowingApiService: Sending return request to backend:', returnRequest);
      
      const response = await this.apiClient.post('/api/borrowing/return', returnRequest);
      
      console.log('BorrowingApiService: Return response:', response.data);
      
      if (response.data.success) {
        // Create a successful borrowing record from the response
        const responseData = response.data.data;
        
        // If the backend returns the full borrowing record, map it
        if (responseData) {
          const borrowingRecord = this.mapBackendResponseToBorrowingRecord(responseData);
          return Result.success(borrowingRecord);
        } else {
          // If no data returned, create a mock successful record
          const mockRecord: BorrowingRecord = {
            borrowingId: data.borrowingId,
            bookId: bookId,
            memberId: memberId,
            bookTitle: 'Book', // We don't have the title in the return response
            bookAuthor: 'Author',
            memberName: 'Member',
            memberEmail: '',
            borrowedAt: new Date(),
            dueDate: new Date(),
            returnedAt: new Date(data.returnDate || new Date()),
            isReturned: true,
            isOverdue: false,
            daysBorrowed: 0,
            daysOverdue: 0,
            lateFee: 0,
            status: this.mapStatusFromString('Returned'),
          };
          
          return Result.success(mockRecord);
        }
      } else {
        return Result.failure(new Error(response.data.error?.message || 'Failed to return book'));
      }
    } catch (error: any) {
      console.error('BorrowingApiService: Return book error:', error);
      console.error('BorrowingApiService: Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Check if it's a validation error
      if (error.response?.status === 400 || error.response?.status === 500) {
        const errorMessage = error.response.data?.error?.message || 
                            error.response.data?.message || 
                            error.response.data?.title ||
                            'Invalid request format';
        return Result.failure(new Error(errorMessage));
      }
      
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

      // Get the member ID from the main response - try multiple field names
      const currentMemberId = backendData.memberId || backendData.memberID || backendData.id || 0;
      const currentMemberName = backendData.memberName || backendData.name || '';
      const currentMemberEmail = backendData.memberEmail || backendData.email || '';

      console.log('BorrowingApiService: Extracted member info - ID:', currentMemberId, 'Name:', currentMemberName);

      // If we still don't have a memberId, this is a problem
      if (currentMemberId === 0) {
        console.error('BorrowingApiService: WARNING - Could not extract memberId from response:', backendData);
      }

      // Try different possible field names for current borrowings
      let currentBorrowingsData = backendData.currentBorrowings || 
                                 backendData.activeBorrowings || 
                                 backendData.borrowings || 
                                 backendData.currentLoans || 
                                 backendData.activeLoans || 
                                 backendData.borrowedBooks ||
                                 [];

      console.log('BorrowingApiService: Current borrowings raw data:', currentBorrowingsData);
      console.log('BorrowingApiService: Will inject memberId:', currentMemberId);

      // Map current borrowings with data enrichment
      const currentBorrowings = Array.isArray(currentBorrowingsData) 
        ? currentBorrowingsData.map((item, index) => {
            console.log(`BorrowingApiService: Processing borrowed book ${index}:`, item);
            
            // Calculate synthetic borrowingId
            const syntheticBorrowingId = item.bookId ? (item.bookId * 10000 + currentMemberId) : 0;
            console.log(`BorrowingApiService: Calculated synthetic borrowingId for book ${item.bookId}: ${syntheticBorrowingId}`);
            
            // Enrich the borrowed book data with missing fields
            const enrichedBorrowingData = {
              // Keep ALL original data
              ...item,
              
              // EXPLICITLY set these fields (override any existing values)
              memberId: currentMemberId,
              memberName: currentMemberName,
              memberEmail: currentMemberEmail,
              borrowingId: syntheticBorrowingId,
              
              // Ensure book info is properly mapped
              bookTitle: item.title || item.bookTitle || '',
              bookAuthor: item.author || item.bookAuthor || '',
              
              // Calculate dueDate if missing (14 days from borrowedAt)
              dueDate: item.dueDate || (() => {
                if (item.borrowedAt) {
                  const due = new Date(item.borrowedAt);
                  due.setDate(due.getDate() + 14);
                  return due.toISOString();
                }
                return new Date().toISOString();
              })(),
              
              // Set default status
              status: item.status || (item.isReturned ? 'Returned' : 'Active')
            };
            
            console.log(`BorrowingApiService: Enriched data for book ${index}:`, {
              borrowingId: enrichedBorrowingData.borrowingId,
              bookId: enrichedBorrowingData.bookId,
              memberId: enrichedBorrowingData.memberId,
              bookTitle: enrichedBorrowingData.bookTitle
            });
            
            try {
              const mapped = this.mapBackendResponseToBorrowingRecord(enrichedBorrowingData);
              console.log(`BorrowingApiService: Final mapped borrowing ${index}:`, {
                borrowingId: mapped?.borrowingId,
                bookId: mapped?.bookId,
                memberId: mapped?.memberId,
                bookTitle: mapped?.bookTitle
              });
              return mapped;
            } catch (error) {
              console.error(`BorrowingApiService: Error mapping borrowing ${index}:`, error);
              return null;
            }
          }).filter(item => item !== null)
        : [];

      console.log('BorrowingApiService: Final mapped borrowings count:', currentBorrowings.length);
      if (currentBorrowings.length > 0) {
        console.log('BorrowingApiService: First borrowing sample:', {
          borrowingId: currentBorrowings[0].borrowingId,
          bookId: currentBorrowings[0].bookId,
          memberId: currentBorrowings[0].memberId
        });
      }

      const status: MemberBorrowingStatus = {
        memberId: currentMemberId,
        memberName: currentMemberName,
        memberEmail: currentMemberEmail,
        memberType: backendData.memberType || backendData.type || '',
        borrowedBooksCount: backendData.borrowedBooksCount || 0,
        maxBooksAllowed: backendData.maxBooksAllowed || backendData.maxBooks || 5,
        canBorrowBooks: backendData.canBorrowBooks ?? true,
        canBorrowMoreBooks: backendData.canBorrowMoreBooks ?? true,
        currentBorrowings: currentBorrowings,
        recentHistory: [], // Keep empty for now
        overdueBorrowings: currentBorrowings.filter(b => b.isOverdue),
        totalLateFees: backendData.totalLateFees || 0,
      };

      return status;
    } catch (error) {
      console.error('BorrowingApiService: Member status mapping error:', error);
      throw new Error(`Failed to map member borrowing status: ${error}`);
    }
  }

  /**
   * Map backend borrowing response to domain entity
   */
  private mapBackendResponseToBorrowingRecord(backendData: any): BorrowingRecord {
    try {
      if (!backendData) {
        return null;
      }

      console.log('BorrowingApiService: Mapping borrowing record with data:', {
        borrowingId: backendData.borrowingId,
        bookId: backendData.bookId,
        memberId: backendData.memberId,
        title: backendData.title || backendData.bookTitle
      });

      // Use the enriched borrowingId directly (don't recalculate)
      const borrowingId = backendData.borrowingId || 0;
      const memberId = backendData.memberId || 0;
      
      console.log('BorrowingApiService: Using borrowingId:', borrowingId, 'memberId:', memberId);
      
      if (borrowingId === 0) {
        console.error('BorrowingApiService: WARNING - borrowingId is still 0 after enrichment!');
        console.error('BorrowingApiService: Full data:', backendData);
      }

      const borrowingRecord: BorrowingRecord = {
        borrowingId: borrowingId,
        bookId: backendData.bookId || 0,
        memberId: memberId,
        bookTitle: backendData.bookTitle || backendData.title || '',
        bookAuthor: backendData.bookAuthor || backendData.author || '',
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
        status: this.mapStatusFromString(backendData.status || 'Active'),
      };

      console.log('BorrowingApiService: Final borrowing record:', {
        borrowingId: borrowingRecord.borrowingId,
        bookId: borrowingRecord.bookId,
        memberId: borrowingRecord.memberId,
        bookTitle: borrowingRecord.bookTitle
      });

      return borrowingRecord;
    } catch (error) {
      console.error('BorrowingApiService: Record mapping error:', error);
      console.error('BorrowingApiService: Failed data:', backendData);
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