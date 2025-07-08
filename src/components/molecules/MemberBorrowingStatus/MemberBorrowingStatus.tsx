import React from 'react';
import { Member } from '../../../domain/entities/Member';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';
import { Badge } from '../../ui/badge';
import { BookOpen, Clock, AlertTriangle, Info } from 'lucide-react';
import { formatDate, calculateDaysOverdue } from '../../../lib/utils';

interface MemberBorrowingStatusProps {
  member: Member;
  className?: string;
}

export const MemberBorrowingStatus: React.FC<MemberBorrowingStatusProps> = ({
  member,
  className
}) => {
  const currentLoans = member.currentLoans || [];
  const overdueBooks = currentLoans.filter(loan => loan.isOverdue);
  
  // Debug logging to help identify the issue
  console.log('🔍 MemberBorrowingStatus Debug:', {
    memberId: member.memberId,
    memberName: member.fullName,
    borrowedBooksCount: member.borrowedBooksCount,
    currentLoansArray: currentLoans,
    currentLoansLength: currentLoans.length,
    hasCurrentLoans: !!member.currentLoans,
    rawCurrentLoans: member.currentLoans
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <span>Current Borrowings</span>
          {member.borrowedBooksCount > 0 && (
            <Badge variant="secondary">
              {member.borrowedBooksCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Data Mismatch Warning */}
        {member.borrowedBooksCount > 0 && currentLoans.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
            <div className="flex items-center gap-2 text-amber-700">
              <Info className="w-4 h-4 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Data Sync Issue</p>
                <p className="text-xs mt-1">
                  Member has {member.borrowedBooksCount} borrowed book{member.borrowedBooksCount !== 1 ? 's' : ''} 
                  but detailed loan information is not available. This may be due to a backend data sync issue.
                </p>
              </div>
            </div>
          </div>
        )}

        {currentLoans.length === 0 ? (
          <div className="text-center py-4">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {member.borrowedBooksCount > 0 
                ? 'Loan details are being synchronized...'
                : 'No books currently borrowed'
              }
            </p>
            {member.borrowedBooksCount > 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Expected {member.borrowedBooksCount} book{member.borrowedBooksCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {overdueBooks.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {overdueBooks.length} Overdue Book{overdueBooks.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
            
            {currentLoans.map((loan, index) => (
              <div key={`${loan.bookId}-${index}`} className="border rounded-lg p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 break-words overflow-wrap-anywhere">
                      {loan.title || 'Unknown Title'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 break-words overflow-wrap-anywhere">
                      by {loan.author || 'Unknown Author'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500">
                        Due: {loan.dueDate ? formatDate(loan.dueDate) : 'No due date'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        Borrowed: {loan.borrowedAt ? formatDate(loan.borrowedAt) : 'Unknown date'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {loan.isOverdue ? (
                      <Badge variant="destructive" className="text-xs">
                        {loan.dueDate ? calculateDaysOverdue(loan.dueDate) : '?'} days overdue
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {loan.daysBorrowed || 0} days
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Show count mismatch if any */}
            {member.borrowedBooksCount !== currentLoans.length && (
              <div className="text-xs text-amber-600 mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                <p>
                  ⚠️ Count mismatch: Expected {member.borrowedBooksCount} book{member.borrowedBooksCount !== 1 ? 's' : ''}, 
                  showing {currentLoans.length} detailed record{currentLoans.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};