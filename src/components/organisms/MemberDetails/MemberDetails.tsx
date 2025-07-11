import React from 'react';
import { Member } from '../../../domain/entities/Member';
import { Card, CardHeader, CardTitle, CardContent } from '../../molecules/Card';
import { MemberTypeBadge } from '../../molecules/MemberTypeBadge';
import { MemberPermissions } from '../../molecules/MemberPermissions';
import { MemberBorrowingStatus } from '../../molecules/MemberBorrowingStatus';
import { Badge } from '../../ui/badge';
import { LoadingState } from '../../molecules/LoadingState';
import { 
  User, 
  Mail, 
  Calendar,
  BookOpen,
  Clock,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { cn } from '../../../lib/utils';
import { useMemberBorrowingStatus } from '../../../presentation/hooks/Borrowing/useMemberBorrowingStatus';

interface MemberDetailsProps {
  member: Member;
  canEdit?: boolean;
  canDelete?: boolean;
  className?: string;
}

export const MemberDetails: React.FC<MemberDetailsProps> = ({
  member,
  canEdit = false,
  canDelete = false,
  className
}) => {
  // FIXED: Get real borrowing status data
  const { status: borrowingStatus, isLoading: borrowingLoading, error: borrowingError } = useMemberBorrowingStatus(member.memberId);

  // FIXED: Better membership duration calculation with validation
  const calculateMembershipDuration = (): number => {
    try {
      const now = new Date();
      const regDate = new Date(member.registrationDate);
      
      // Validate the registration date
      if (isNaN(regDate.getTime())) {
        console.warn('Invalid registration date:', member.registrationDate);
        return 0;
      }
      
      const diffTime = now.getTime() - regDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch (error) {
      console.error('Error calculating membership duration:', error);
      return 0;
    }
  };

  const membershipDurationDays = calculateMembershipDuration();

  // Safely get member display name and email
  const displayName = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown Member';

  // FIXED: Get current borrowings and statistics from borrowing status
  const currentBorrowings = borrowingStatus?.currentBorrowings || [];
  const overdueBorrowings = currentBorrowings.filter(b => b.isOverdue);
  const totalLateFees = borrowingStatus?.totalLateFees || 0;

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header Card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {displayName}
                </h1>
                
                <div className="flex items-center gap-6 mb-6">
                  <MemberTypeBadge 
                    memberType={member.memberType} 
                    variant="detailed" 
                  />
                  <Badge 
                    variant={member.isActive ? 'default' : 'destructive'}
                    className={cn(
                      "text-sm px-3 py-1",
                      member.isActive 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    )}
                  >
                    {member.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards - FIXED: Use real borrowing data */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {borrowingLoading ? '...' : currentBorrowings.length}
                </p>
                <p className="text-sm font-medium text-gray-600">Currently Borrowed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {member.borrowingHistory?.length || 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Total Borrowed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {borrowingLoading ? '...' : overdueBorrowings.length}
                </p>
                <p className="text-sm font-medium text-gray-600">Overdue Books</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  ${borrowingLoading ? '...' : totalLateFees.toFixed(2)}
                </p>
                <p className="text-sm font-medium text-gray-600">Late Fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Permissions */}
        <MemberPermissions member={member} />
        
        {/* Current Borrowings - FIXED: Show real current borrowings */}
        <Card>
          <CardHeader className="p-6 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <BookOpen className="w-6 h-6" />
              Current Borrowings ({currentBorrowings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {borrowingLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingState message="Loading current borrowings..." />
              </div>
            ) : borrowingError ? (
              <div className="text-center py-8 text-red-600">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <p>Error loading borrowings: {borrowingError}</p>
              </div>
            ) : currentBorrowings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No Current Borrowings</p>
                <p className="text-sm">This member has no books borrowed currently.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentBorrowings.map((borrowing) => (
                  <div key={borrowing.borrowingId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900 mb-1">
                          {borrowing.bookTitle}
                        </h4>
                        <p className="text-base text-gray-600 mb-3">
                          by {borrowing.bookAuthor}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>Borrowed: {formatDate(borrowing.borrowedAt)}</span>
                          <span>Due: {formatDate(borrowing.dueDate)}</span>
                          <span>{borrowing.daysBorrowed} days</span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-4 flex flex-col items-end gap-2">
                        <Badge 
                          variant={borrowing.isOverdue ? 'destructive' : 'outline'}
                          className={cn(
                            "text-sm px-3 py-1",
                            borrowing.isOverdue 
                              ? 'bg-red-100 text-red-800 border-red-200' 
                              : borrowing.isReturned 
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-blue-100 text-blue-800 border-blue-200'
                          )}
                        >
                          {borrowing.isReturned ? 'Returned' : borrowing.isOverdue ? `Overdue (${borrowing.daysOverdue} days)` : 'Active'}
                        </Badge>
                        
                        {borrowing.lateFee > 0 && (
                          <span className="text-sm text-red-600 font-medium">
                            Late Fee: ${borrowing.lateFee.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Borrowing History */}
      {member.borrowingHistory && member.borrowingHistory.length > 0 && (
        <Card>
          <CardHeader className="p-6 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <BookOpen className="w-6 h-6" />
              Borrowing History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="space-y-4">
              {member.borrowingHistory.slice(0, 5).map((record, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 mb-1">
                        {record.bookTitle}
                      </h4>
                      <p className="text-base text-gray-600 mb-3">
                        by {record.bookAuthor}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>Borrowed: {formatDate(record.borrowedAt)}</span>
                        {record.returnedAt && (
                          <span>Returned: {formatDate(record.returnedAt)}</span>
                        )}
                        <span>{record.daysBorrowed} days</span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <Badge 
                        variant={record.isOverdue ? 'destructive' : 'outline'}
                        className="text-sm px-3 py-1"
                      >
                        {record.returnedAt ? 'Returned' : record.isOverdue ? 'Overdue' : 'Borrowed'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              
              {member.borrowingHistory.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-base text-gray-500 font-medium">
                    and {member.borrowingHistory.length - 5} more records...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};