import React, { useState } from 'react';
import { BookCategory, BookFilters as BookFiltersType } from '../../../services/api/types';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Filter, X, RotateCcw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../ui/dropdown-menu';

interface BookFiltersProps {
  filters: BookFiltersType;
  onFiltersChange: (filters: Partial<BookFiltersType>) => void;
  onClearFilters: () => void;
  className?: string;
}

const categories = Object.values(BookCategory);

export const BookFilters: React.FC<BookFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className
}) => {
  const [authorInput, setAuthorInput] = useState(filters.author || '');

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== null
  ).length;

  const hasActiveFilters = activeFiltersCount > 0;

  const handleAuthorSubmit = () => {
    onFiltersChange({ author: authorInput || undefined });
  };

  const handleAuthorKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAuthorSubmit();
    }
  };

  const handleAuthorClear = () => {
    setAuthorInput('');
    onFiltersChange({ author: undefined });
  };

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
            {/* Category Filter */}
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Category</p>
              <div className="grid grid-cols-1 gap-1">
                <DropdownMenuItem
                  onClick={() => onFiltersChange({ category: undefined })}
                  className={!filters.category ? 'bg-accent' : ''}
                >
                  All Categories
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => onFiltersChange({ category })}
                    className={filters.category === category ? 'bg-accent' : ''}
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Author Filter */}
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Author</p>
              <div className="space-y-2">
                <Input
                  placeholder="Enter author name..."
                  value={authorInput}
                  onChange={(e) => setAuthorInput(e.target.value)}
                  onKeyPress={handleAuthorKeyPress}
                  className="h-8"
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={handleAuthorSubmit}
                    className="flex-1 h-7 text-xs"
                  >
                    Apply
                  </Button>
                  {filters.author && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAuthorClear}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Sort Options */}
            <div className="p-2">
              <p className="text-sm font-medium mb-2">Sort By</p>
              <div className="grid grid-cols-1 gap-1">
                <DropdownMenuItem
                  onClick={() => onFiltersChange({ sortBy: 'title', sortDirection: 'asc' })}
                  className={filters.sortBy === 'title' ? 'bg-accent' : ''}
                >
                  Title A-Z
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFiltersChange({ sortBy: 'author', sortDirection: 'asc' })}
                  className={filters.sortBy === 'author' ? 'bg-accent' : ''}
                >
                  Author A-Z
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onFiltersChange({ sortBy: 'publicationYear', sortDirection: 'desc' })}
                  className={filters.sortBy === 'publicationYear' ? 'bg-accent' : ''}
                >
                  Newest First
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
            
            {filters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {filters.category}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({ category: undefined })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {filters.author && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Author: {filters.author}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => {
                    setAuthorInput('');
                    onFiltersChange({ author: undefined });
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {filters.sortBy && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Sort: {filters.sortBy}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => onFiltersChange({ sortBy: undefined, sortDirection: undefined })}
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