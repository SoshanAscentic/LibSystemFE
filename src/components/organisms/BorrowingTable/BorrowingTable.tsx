import React, { useState } from 'react';
import { BorrowingRecord, BorrowingStatus } from '../../../domain/entities/BorrowingRecord';
import { BorrowingFilters as BorrowingFiltersType, BorrowingSorting } from '../../../domain/dtos/BorrowingDto';
import { BorrowingFilters } from '../../molecules/BorrowingFilters';
import { OverdueBadge } from '../../molecules/OverdueBadge';
import { LoadingState } from '../../molecules/LoadingState';
import { EmptyState } from '../../molecules/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { BookOpen, User, Calendar, Eye, RotateCcw, Filter, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

interface BorrowingTableProps {
  borrowings: BorrowingRecord[];
  filters?: BorrowingFiltersType;
  sorting?: BorrowingSorting;
  onFiltersChange?: (filters: Partial<BorrowingFiltersType>) => void;
  onSortingChange?: (sorting: BorrowingSorting) => void;
  onClearFilters?: () => void;
  onBorrowingView?: (borrowing: BorrowingRecord) => void;
  onBorrowingReturn?: (borrowing: BorrowingRecord) => void;
  isLoading?: boolean;
  showFilters?: boolean;
  showMemberInfo?: boolean;
  showBookInfo?: boolean;
  canReturn?: boolean;
  memberOptions?: Array<{ id: number; name: string }>;
  bookOptions?: Array<{ id: number; title: string; author: string }>;
  emptyMessage?: string;
  className?: string;
}

export const BorrowingTable: React.FC<BorrowingTableProps> = ({
  borrowings,
  filters = {},
  sorting = {},
  onFiltersChange,
  onSortingChange,
  onClearFilters,
  onBorrowingView,
  onBorrowingReturn,
  isLoading = false,
  showFilters = true,
  showMemberInfo = true,
  showBookInfo = true,
  canReturn = false,
  memberOptions = [],
  bookOptions = [],
  emptyMessage = "No borrowing records found",
  className
}) => {
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const getStatusColor = (status: BorrowingStatus, isOverdue: boolean) => {
    switch (status) {
      case BorrowingStatus.ACTIVE:
        return isOverdue 
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

  const getSortIcon = (field: string) => {
    if (sorting.sortBy !== field) return null;
    return sorting.sortDirection === 'desc' ? 
      <ChevronDown className="w-4 h-4 ml-1" /> : 
      <ChevronUp className="w-4 h-4 ml-1" />;
  };

  const handleSort = (field: string) => {
    if (!onSortingChange) return;

    const newDirection = sorting.sortBy === field && sorting.sortDirection === 'asc' ? 'desc' : 'asc';
    onSortingChange({
      sortBy: field as any,
      sortDirection: newDirection
    });
  };

  const renderSortableHeader = (label: string, field: string) => (
    <TableHead>
      <button
        className="flex items-center hover:text-gray-900 transition-colors"
        onClick={() => handleSort(field)}
      >
        {label}
        {getSortIcon(field)}
      </button>
    </TableHead>
  );

  if (isLoading) {
    return <LoadingState message="Loading borrowing records..." />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filters */}
      {showFilters && onFiltersChange && onSortingChange && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Borrowing Records</h3>
            <Button
              variant="outline"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {showFiltersPanel ? 
                <ChevronUp className="w-4 h-4 ml-2" /> : 
                <ChevronDown className="w-4 h-4 ml-2" />
              }
            </Button>
          </div>

          {showFiltersPanel && (
            <BorrowingFilters
              filters={filters}
              sorting={sorting}
              onFiltersChange={onFiltersChange}
              onSortingChange={onSortingChange}
              onClearFilters={onClearFilters || (() => {})}
              memberOptions={memberOptions}
              bookOptions={bookOptions}
              isLoading={isLoading}
            />
          )}
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Borrowing Records ({borrowings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {borrowings.length === 0 ? (
            <EmptyState
              icon={<BookOpen />}
              title="No Records Found"
              description={emptyMessage}
            />
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    {showBookInfo && renderSortableHeader('Book', 'bookTitle')}
                    {showMemberInfo && renderSortableHeader('Member', 'memberName')}
                    {renderSortableHeader('Borrowed', 'borrowedAt')}
                    {renderSortableHeader('Due Date', 'dueDate')}
                    <TableHead>Duration</TableHead>
                    {renderSortableHeader('Returned', 'returnedAt')}
                    <TableHead>Late Fee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowings.map((borrowing) => (
                    <TableRow key={borrowing.borrowingId} className="hover:bg-gray-50">
                      {/* Status */}
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getStatusColor(borrowing.status, borrowing.isOverdue)}>
                            {borrowing.status}
                          </Badge>
                          {borrowing.isOverdue && (
                            <OverdueBadge 
                              daysOverdue={borrowing.daysOverdue} 
                              size="sm"
                              showIcon={false}
                            />
                          )}
                        </div>
                      </TableCell>

                      {/* Book Info */}
                      {showBookInfo && (
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">
                                {borrowing.bookTitle}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                by {borrowing.bookAuthor}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      )}

                      {/* Member Info */}
                      {showMemberInfo && (
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8 flex-shrink-0">
                              <AvatarFallback className="text-xs">
                                {borrowing.memberName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">
                                {borrowing.memberName}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {borrowing.memberEmail}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      )}

                      {/* Borrowed Date */}
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">
                            {formatDate(borrowing.borrowedAt)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatRelativeTime(borrowing.borrowedAt)}
                          </p>
                        </div>
                      </TableCell>

                      {/* Due Date */}
                      <TableCell>
                        <div>
                          <p className={cn(
                            "text-sm font-medium",
                            borrowing.isOverdue && "text-red-600"
                          )}>
                            {formatDate(borrowing.dueDate)}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatRelativeTime(borrowing.dueDate)}
                          </p>
                        </div>
                      </TableCell>

                      {/* Duration */}
                      <TableCell>
                        <span className="text-sm">
                          {borrowing.daysBorrowed} day{borrowing.daysBorrowed !== 1 ? 's' : ''}
                        </span>
                      </TableCell>

                      {/* Return Date */}
                      <TableCell>
                        {borrowing.returnedAt ? (
                          <div>
                            <p className="text-sm font-medium">
                              {formatDate(borrowing.returnedAt)}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatRelativeTime(borrowing.returnedAt)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not returned</span>
                        )}
                      </TableCell>

                      {/* Late Fee */}
                      <TableCell>
                        {borrowing.lateFee > 0 ? (
                          <span className="text-sm font-medium text-red-600">
                            ${borrowing.lateFee.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onBorrowingView && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onBorrowingView(borrowing)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          {canReturn && !borrowing.isReturned && onBorrowingReturn && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onBorrowingReturn(borrowing)}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Return
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};