import React from 'react';
import { BorrowingRecord, BorrowingStatus } from '../../../domain/entities/BorrowingRecord';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Calendar, User, Book, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDate, formatRelativeTime, isOverdue, getDaysUntilDue } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

interface BorrowingCardProps {
  borrowing: BorrowingRecord;
  onReturn?: (borrowing: BorrowingRecord) => void;
  onViewDetails?: (borrowing: BorrowingRecord) => void;
  showMemberInfo?: boolean;
  showBookInfo?: boolean;
  canReturn?: boolean;
  className?: string;
}

export const BorrowingCard: React.FC<BorrowingCardProps> = ({
  borrowing,
  onReturn,
  onViewDetails,
  showMemberInfo = true,
  showBookInfo = true,
  canReturn = false,
  className
}) => {
  const getStatusColor = (status: BorrowingStatus) => {
    switch (status) {
      case BorrowingStatus.ACTIVE:
        return borrowing.isOverdue 
          ? 'bg-red-100 text-red-800 border-red-200'
          : 'bg-blue-100 text-blue-800 border-blue-200';
      case BorrowingStatus.RETURNED:
        return 'bg-green-100 text-green-800 border-green-200';
      case BorrowingStatus.OVERDUE:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: BorrowingStatus) => {
    switch (status) {
      case BorrowingStatus.ACTIVE:
        return borrowing.isOverdue ? <AlertTriangle className="w-4 h-4" /> : <Clock className="w-4 h-4" />;
      case BorrowingStatus.RETURNED:
        return <CheckCircle className="w-4 h-4" />;
      case BorrowingStatus.OVERDUE:
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getDueDateStatus = () => {
    if (borrowing.isReturned) return null;
    
    if (borrowing.isOverdue) {
      return (
        <div className="flex items-center gap-1 text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {borrowing.daysOverdue} day{borrowing.daysOverdue !== 1 ? 's' : ''} overdue
          </span>
        </div>
      );
    }

    const daysUntilDue = getDaysUntilDue(borrowing.dueDate);
    if (daysUntilDue <= 3) {
      return (
        <div className="flex items-center gap-1 text-amber-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            Due {daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`}
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(borrowing.status)}
            <Badge className={getStatusColor(borrowing.status)}>
              {borrowing.status}
            </Badge>
          </div>
          <div className="flex gap-2">
            {onViewDetails && (
              <Button variant="ghost" size="sm" onClick={() => onViewDetails(borrowing)}>
                Details
              </Button>
            )}
            {canReturn && !borrowing.isReturned && onReturn && (
              <Button size="sm" onClick={() => onReturn(borrowing)}>
                Return
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Book Information */}
        {showBookInfo && (
          <div className="flex items-start gap-3">
            <Book className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate">
                {borrowing.bookTitle}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                by {borrowing.bookAuthor}
              </p>
            </div>
          </div>
        )}

        {/* Member Information */}
        {showMemberInfo && (
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">
                {borrowing.memberName}
              </p>
              <p className="text-sm text-gray-600 truncate">
                {borrowing.memberEmail}
              </p>
            </div>
          </div>
        )}

        {/* Date Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Borrowed</span>
                <span className="text-sm font-medium">
                  {formatDate(borrowing.borrowedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Due</span>
                <span className="text-sm font-medium">
                  {formatDate(borrowing.dueDate)}
                </span>
              </div>
              {borrowing.returnedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Returned</span>
                  <span className="text-sm font-medium">
                    {formatDate(borrowing.returnedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Due Date Status */}
          {getDueDateStatus() && (
            <div className="mt-2">
              {getDueDateStatus()}
            </div>
          )}
        </div>

        {/* Late Fee */}
        {borrowing.lateFee > 0 && (
          <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-md">
            <span className="text-sm font-medium text-red-800">Late Fee</span>
            <span className="text-sm font-bold text-red-800">
              ${borrowing.lateFee.toFixed(2)}
            </span>
          </div>
        )}

        {/* Duration */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Duration</span>
          <span>
            {borrowing.daysBorrowed} day{borrowing.daysBorrowed !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};