import React, { useState } from 'react';
import { Book, BookFilters } from '../../../services/api/types';
import { BookCard } from '../../molecules/BookCard';
import { BookFilters as BookFiltersComponent } from '../../molecules/BookFilters';
import { LoadingState } from '../../molecules/LoadingState';
import { EmptyState } from '../../molecules/EmptyState';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Grid, List, Plus, BookOpen } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface BooksGridProps {
  books: Book[];
  isLoading?: boolean;
  filters: BookFilters;
  onFiltersChange: (filters: Partial<BookFilters>) => void;
  onClearFilters: () => void;
  onBookView?: (book: Book) => void;
  onBookDelete?: (book: Book) => void;
  onBookBorrow?: (book: Book) => void;
  onAddBook?: () => void;
  canDelete?: boolean;
  canBorrow?: boolean;
  canAdd?: boolean;
  className?: string;
}

type ViewMode = 'grid' | 'list';

export const BooksGrid: React.FC<BooksGridProps> = ({
  books,
  isLoading = false,
  filters,
  onFiltersChange,
  onClearFilters,
  onBookView,
  onBookDelete,
  onBookBorrow,
  onAddBook,
  canDelete = false,
  canBorrow = false,
  canAdd = false,
  className
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  if (isLoading) {
    return (
      <div className={className}>
        <LoadingState message="Loading books..." />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with filters and view controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Books</h2>
            <p className="text-gray-600">
              {books.length} book{books.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {/* Filters */}
        <BookFiltersComponent
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />
      </div>

      {/* Books Display */}
      {books.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<BookOpen />}
            title="No books found"
            description="No books match your current filters. Try adjusting your search criteria."
            action={
              canAdd && onAddBook ? {
                label: "Add First Book",
                onClick: onAddBook
              } : undefined
            }
          />
        </Card>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          )}
        >
          {books.map((book) => (
            <BookCard
              key={book.bookId}
              book={book}
              variant={viewMode === 'list' ? 'compact' : 'default'}
              onView={onBookView}
              onDelete={onBookDelete}
              onBorrow={onBookBorrow}
              canDelete={canDelete}
              canBorrow={canBorrow}
            />
          ))}
        </div>
      )}
    </div>
  );
};