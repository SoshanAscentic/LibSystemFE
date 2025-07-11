import React, { useState } from 'react';
import { BorrowingRecord } from '../../../domain/entities/BorrowingRecord';
import { BorrowingFilters as BorrowingFiltersType, BorrowingSorting } from '../../../domain/dtos/BorrowingDto';
import { BorrowingTable } from '../BorrowingTable';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { History, Download, Filter, BarChart3 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface BorrowingHistoryProps {
  borrowings: BorrowingRecord[];
  filters?: BorrowingFiltersType;
  sorting?: BorrowingSorting;
  onFiltersChange?: (filters: Partial<BorrowingFiltersType>) => void;
  onSortingChange?: (sorting: BorrowingSorting) => void;
  onClearFilters?: () => void;
  onBorrowingView?: (borrowing: BorrowingRecord) => void;
  onBorrowingReturn?: (borrowing: BorrowingRecord) => void;
  onExportData?: () => void;
  isLoading?: boolean;
  showFilters?: boolean;
  showMemberInfo?: boolean;
  showBookInfo?: boolean;
  canReturn?: boolean;
  memberOptions?: Array<{ id: number; name: string }>;
  bookOptions?: Array<{ id: number; title: string; author: string }>;
  title?: string;
  className?: string;
}

export const BorrowingHistory: React.FC<BorrowingHistoryProps> = ({
  borrowings,
  filters = {},
  sorting = {},
  onFiltersChange,
  onSortingChange,
  onClearFilters,
  onBorrowingView,
  onBorrowingReturn,
  onExportData,
  isLoading = false,
  showFilters = true,
  showMemberInfo = true,
  showBookInfo = true,
  canReturn = false,
  memberOptions = [],
  bookOptions = [],
  title = "Borrowing History",
  className
}) => {
  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = borrowings.length;
    const active = borrowings.filter(b => !b.isReturned).length;
    const returned = borrowings.filter(b => b.isReturned).length;
    const overdue = borrowings.filter(b => b.isOverdue && !b.isReturned).length;
    const totalLateFees = borrowings.reduce((sum, b) => sum + b.lateFee, 0);

    return {
      total,
      active,
      returned,
      overdue,
      totalLateFees
    };
  }, [borrowings]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              {title}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {onExportData && (
                <Button variant="outline" size="sm" onClick={onExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.returned}</div>
              <div className="text-sm text-gray-600">Returned</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                ${stats.totalLateFees.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Late Fees</div>
            </div>
          </div>

          {/* Quick Status Filters */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <Badge
              variant={!filters.status ? "default" : "outline"}
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => onFiltersChange?.({ status: undefined })}
            >
              All ({stats.total})
            </Badge>
            <Badge
              variant={filters.status === 'Active' ? "default" : "outline"}
              className="cursor-pointer hover:bg-blue-100"
              onClick={() => onFiltersChange?.({ status: 'Active' as any })}
            >
              Active ({stats.active})
            </Badge>
            <Badge
              variant={filters.status === 'Returned' ? "default" : "outline"}
              className="cursor-pointer hover:bg-green-100"
              onClick={() => onFiltersChange?.({ status: 'Returned' as any })}
            >
              Returned ({stats.returned})
            </Badge>
            <Badge
              variant={filters.isOverdue === true ? "default" : "outline"}
              className="cursor-pointer hover:bg-red-100"
              onClick={() => onFiltersChange?.({ isOverdue: filters.isOverdue === true ? undefined : true })}
            >
              Overdue ({stats.overdue})
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Borrowing Table */}
      <BorrowingTable
        borrowings={borrowings}
        filters={filters}
        sorting={sorting}
        onFiltersChange={onFiltersChange}
        onSortingChange={onSortingChange}
        onClearFilters={onClearFilters}
        onBorrowingView={onBorrowingView}
        onBorrowingReturn={onBorrowingReturn}
        isLoading={isLoading}
        showFilters={showFilters}
        showMemberInfo={showMemberInfo}
        showBookInfo={showBookInfo}
        canReturn={canReturn}
        memberOptions={memberOptions}
        bookOptions={bookOptions}
        emptyMessage="No borrowing history found"
      />
    </div>
  );
};