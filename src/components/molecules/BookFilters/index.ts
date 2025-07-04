export { BookFilters } from './BookFilters';
import React from 'react';
import { Book } from '../../../services/api/types';
import { BookCard } from '../BookCard';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';
import { Card } from '../../ui/card';
import { Search, BookOpen } from 'lucide-react';

interface BookSearchResultsProps {
  results: Book[];
  isLoading: boolean;
  hasSearchQuery: boolean;
  searchQuery: string;
  onBookView?: (book: Book) => void;
  onBookEdit?: (book: Book) => void;
  onBookDelete?: (book: Book) => void;
  onBookBorrow?: (book: Book) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canBorrow?: boolean;
  className?: string;
}

export const BookSearchResults: React.FC<BookSearchResultsProps> = ({
  results,
  isLoading,
  hasSearchQuery,
  searchQuery,
  onBookView,
  onBookEdit,
  onBookDelete,
  onBookBorrow,
  canEdit = false,
  canDelete = false,
  canBorrow = false,
  className
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <LoadingState message="Searching books..." />
      </Card>
    );
  }

  if (!hasSearchQuery) {
    return (
      <Card className={className}>
        <EmptyState
          icon={Search}
          title="Start searching"
          description="Type at least 2 characters to search for books"
        />
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className={className}>
        <EmptyState
          icon={BookOpen}
          title="No books found"
          description={`No books match "${searchQuery}". Try different keywords or check your spelling.`}
        />
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Search Results
        </h3>
        <p className="text-sm text-gray-600">
          {results.length} book{results.length !== 1 ? 's' : ''} found for "{searchQuery}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((book) => (
          <BookCard
            key={book.bookId}
            book={book}
            variant="compact"
            onView={onBookView}
            onEdit={onBookEdit}
            onDelete={onBookDelete}
            onBorrow={onBookBorrow}
            canEdit={canEdit}
            canDelete={canDelete}
            canBorrow={canBorrow}
          />
        ))}
      </div>
    </div>
  );
};