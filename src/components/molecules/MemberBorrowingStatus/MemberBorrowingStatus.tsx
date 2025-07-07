import React from 'react';
import { Member } from '../../../domain/entities/Member';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';
import { Badge } from '../../ui/badge';
import { BookOpen, Clock, AlertTriangle } from 'lucide-react';
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
        {currentLoans.length === 0 ? (
          <div className="text-center py-4">
            <BookOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No books currently borrowed</p>
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
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {loan.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      by {loan.author}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Due: {formatDate(loan.dueDate)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 ml-2">
                    {loan.isOverdue ? (
                      <Badge variant="destructive" className="text-xs">
                        {calculateDaysOverdue(loan.dueDate)} days overdue
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {loan.daysBorrowed} days
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};