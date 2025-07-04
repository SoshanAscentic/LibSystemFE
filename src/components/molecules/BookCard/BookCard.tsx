import React from 'react';
import { Book } from '../../../services/api/types';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { BookOpen, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { cn } from '../../../lib/utils';

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact' | 'detailed';
  onView?: (book: Book) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  onBorrow?: (book: Book) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canBorrow?: boolean;
  className?: string;
}

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'fiction':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'history':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'child':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const BookCard: React.FC<BookCardProps> = ({
  book,
  variant = 'default',
  onView,
  onEdit,
  onDelete,
  onBorrow,
  canEdit = false,
  canDelete = false,
  canBorrow = false,
  className
}) => {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-200 hover:shadow-md',
      !book.isAvailable && 'opacity-75',
      className
    )}>
      <div className={cn(
        'p-4',
        isCompact && 'p-3',
        isDetailed && 'p-6'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold text-gray-900 truncate',
              isCompact && 'text-sm',
              isDetailed && 'text-lg'
            )}>
              {book.title}
            </h3>
            <p className={cn(
              'text-gray-600 truncate mt-1',
              isCompact && 'text-xs',
              'text-sm'
            )}>
              by {book.author}
            </p>
          </div>

          {/* Actions Menu */}
          {(canEdit || canDelete || onView) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(book)}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                {canEdit && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(book)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Book
                  </DropdownMenuItem>
                )}
                {canDelete && onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(book)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Book
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Book Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className={getCategoryColor(book.category)}
            >
              {book.category}
            </Badge>
            <Badge 
              variant={book.isAvailable ? 'default' : 'destructive'}
              className={cn(
                book.isAvailable 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-red-100 text-red-800 border-red-200'
              )}
            >
              {book.isAvailable ? 'Available' : 'Borrowed'}
            </Badge>
          </div>

          {isDetailed && (
            <p className="text-sm text-gray-500">
              Published: {book.publicationYear}
            </p>
          )}

          {!isCompact && (
            <p className="text-xs text-gray-500">
              {book.publicationYear}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {onView && (
            <Button 
              variant="outline" 
              size={isCompact ? "sm" : "default"}
              onClick={() => onView(book)}
              className="flex-1"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              View
            </Button>
          )}
          
          {canBorrow && book.isAvailable && onBorrow && (
            <Button 
              size={isCompact ? "sm" : "default"}
              onClick={() => onBorrow(book)}
              className="flex-1"
            >
              Borrow
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};