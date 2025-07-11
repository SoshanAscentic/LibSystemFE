//src/components/molecules/BorrowingFilters/BorrowingFilters.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { BorrowingFilters as BorrowingFiltersType, BorrowingSorting } from '../../../domain/dtos/BorrowingDto';
import { BorrowingStatus } from '../../../domain/entities/BorrowingRecord';
import { Filter, X, Calendar } from 'lucide-react';

interface BorrowingFiltersProps {
  filters: BorrowingFiltersType;
  sorting: BorrowingSorting;
  onFiltersChange: (filters: Partial<BorrowingFiltersType>) => void;
  onSortingChange: (sorting: BorrowingSorting) => void;
  onClearFilters: () => void;
  memberOptions?: Array<{ id: number; name: string }>;
  bookOptions?: Array<{ id: number; title: string; author: string }>;
  isLoading?: boolean;
}

export const BorrowingFilters: React.FC<BorrowingFiltersProps> = ({
  filters,
  sorting,
  onFiltersChange,
  onSortingChange,
  onClearFilters,
  memberOptions = [],
  bookOptions = [],
  isLoading = false
}) => {
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  const handleFilterChange = (key: keyof BorrowingFiltersType, value: any) => {
    onFiltersChange({ [key]: value || undefined });
  };

  const handleSortChange = (field: string, value: string) => {
    onSortingChange({
      ...sorting,
      [field]: value || undefined
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <CardTitle className="text-lg">Filters & Sorting</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Member Filter */}
          <div className="space-y-2">
            <Label htmlFor="member-filter">Member</Label>
            <Select
              value={filters.memberId?.toString() || ''}
              onValueChange={(value) => handleFilterChange('memberId', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All members</SelectItem>
                {memberOptions.map((member) => (
                  <SelectItem key={member.id} value={member.id.toString()}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Book Filter */}
          <div className="space-y-2">
            <Label htmlFor="book-filter">Book</Label>
            <Select
              value={filters.bookId?.toString() || ''}
              onValueChange={(value) => handleFilterChange('bookId', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All books" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All books</SelectItem>
                {bookOptions.map((book) => (
                  <SelectItem key={book.id} value={book.id.toString()}>
                    {book.title} - {book.author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={filters.status || ''}
              onValueChange={(value) => handleFilterChange('status', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value={BorrowingStatus.ACTIVE}>Active</SelectItem>
                <SelectItem value={BorrowingStatus.RETURNED}>Returned</SelectItem>
                <SelectItem value={BorrowingStatus.OVERDUE}>Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Overdue Filter */}
          <div className="space-y-2">
            <Label htmlFor="overdue-filter">Overdue Only</Label>
            <Select
              value={filters.isOverdue?.toString() || ''}
              onValueChange={(value) => handleFilterChange('isOverdue', value === 'true' ? true : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All records" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All records</SelectItem>
                <SelectItem value="true">Overdue only</SelectItem>
                <SelectItem value="false">Not overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4" />
            <Label className="text-sm font-medium">Date Ranges</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Borrowed Date Range */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Borrowed After</Label>
              <Input
                type="date"
                value={filters.borrowedAfter || ''}
                onChange={(e) => handleFilterChange('borrowedAfter', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Borrowed Before</Label>
              <Input
                type="date"
                value={filters.borrowedBefore || ''}
                onChange={(e) => handleFilterChange('borrowedBefore', e.target.value)}
              />
            </div>

            {/* Due Date Range */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Due After</Label>
              <Input
                type="date"
                value={filters.dueAfter || ''}
                onChange={(e) => handleFilterChange('dueAfter', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Due Before</Label>
              <Input
                type="date"
                value={filters.dueBefore || ''}
                onChange={(e) => handleFilterChange('dueBefore', e.target.value)}
              />
            </div>

            {/* Return Date Range */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Returned After</Label>
              <Input
                type="date"
                value={filters.returnedAfter || ''}
                onChange={(e) => handleFilterChange('returnedAfter', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Returned Before</Label>
              <Input
                type="date"
                value={filters.returnedBefore || ''}
                onChange={(e) => handleFilterChange('returnedBefore', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Sorting */}
        <div className="border-t pt-4">
          <Label className="text-sm font-medium mb-3 block">Sorting</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Sort By</Label>
              <Select
                value={sorting.sortBy || ''}
                onValueChange={(value) => handleSortChange('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default</SelectItem>
                  <SelectItem value="borrowedAt">Borrowed Date</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="returnedAt">Return Date</SelectItem>
                  <SelectItem value="memberName">Member Name</SelectItem>
                  <SelectItem value="bookTitle">Book Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Direction</Label>
              <Select
                value={sorting.sortDirection || ''}
                onValueChange={(value) => handleSortChange('sortDirection', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Default</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};