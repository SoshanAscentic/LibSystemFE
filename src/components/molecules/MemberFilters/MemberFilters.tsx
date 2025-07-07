import React from 'react';
import { MemberType, MemberFilters as MemberFiltersType } from '../../../domain/entities/Member';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Filter, X, RotateCcw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../ui/dropdown-menu';

interface MemberFiltersProps {
  filters: MemberFiltersType;
  onFiltersChange: (filters: Partial<MemberFiltersType>) => void;
  onClearFilters: () => void;
  className?: string;
}

const memberTypes = Object.values(MemberType);

const getMemberTypeLabel = (type: MemberType) => {
  switch (type) {
    case MemberType.REGULAR_MEMBER:
      return 'Regular Member';
    case MemberType.MINOR_STAFF:
      return 'Minor Staff';
    case MemberType.MANAGEMENT_STAFF:
      return 'Management Staff';
    default:
      return type;
  }
};

export const MemberFilters: React.FC<MemberFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className
}) => {
  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length;

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className={className}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Main Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {/* Member Type Filter */}
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Member Type</p>
              <div className="grid grid-cols-1 gap-1">
                <DropdownMenuItem
                  onClick={() => onFiltersChange({ memberType: undefined })}
                  className={!filters.memberType ? 'bg-accent' : ''}
                >
                  All Types
                </DropdownMenuItem>
                {memberTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => onFiltersChange({ memberType: type })}
                    className={filters.memberType === type ? 'bg-accent' : ''}
                  >
                    {getMemberTypeLabel(type)}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Status Filter */}
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Status</p>
              <div className="grid grid-cols-1 gap-1">
                <DropdownMenuItem
                  onClick={() => onFiltersChange({ isActive: undefined })}
                  className={filters.isActive === undefined ? 'bg-accent' : ''}
                >
                  All Members
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFiltersChange({ isActive: true })}
                  className={filters.isActive === true ? 'bg-accent' : ''}
                >
                  Active Only
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFiltersChange({ isActive: false })}
                  className={filters.isActive === false ? 'bg-accent' : ''}
                >
                  Inactive Only
                </DropdownMenuItem>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Borrowing Filter */}
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Borrowing Status</p>
              <div className="grid grid-cols-1 gap-1">
                <DropdownMenuItem
                  onClick={() => onFiltersChange({ hasBorrowedBooks: undefined })}
                  className={filters.hasBorrowedBooks === undefined ? 'bg-accent' : ''}
                >
                  All Members
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFiltersChange({ hasBorrowedBooks: true })}
                  className={filters.hasBorrowedBooks === true ? 'bg-accent' : ''}
                >
                  Has Borrowed Books
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFiltersChange({ hasBorrowedBooks: false })}
                  className={filters.hasBorrowedBooks === false ? 'bg-accent' : ''}
                >
                  No Borrowed Books
                </DropdownMenuItem>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Card className="mt-3 p-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            
            {filters.memberType && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {getMemberTypeLabel(filters.memberType)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({ memberType: undefined })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {filters.isActive !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.isActive ? 'Active' : 'Inactive'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({ isActive: undefined })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {filters.hasBorrowedBooks !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.hasBorrowedBooks ? 'Has Borrowed Books' : 'No Borrowed Books'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({ hasBorrowedBooks: undefined })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};