import React from 'react';
import { Book } from '../../../services/api/types';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { BookStatusBadge } from '../../molecules/BookStatusBadge';
import { Trash2, BookOpen, Calendar, User, Tag } from 'lucide-react';

interface BookDetailsProps {
  book: Book;
  onDelete?: (book: Book) => void;
  onBorrow?: (book: Book) => void;
  onReturn?: (book: Book) => void;
  canDelete?: boolean;
  canBorrow?: boolean;
  canReturn?: boolean;
  isLoading?: boolean;
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

export const BookDetails: React.FC<BookDetailsProps> = ({
  book,
  onDelete,
  onBorrow,
  onReturn,
  canDelete = false,
  canBorrow = false,
  canReturn = false,
  isLoading = false,
  className
}) => {
  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {book.title}
            </h1>
            <div className="flex items-center gap-2 mb-4">
              <BookStatusBadge isAvailable={book.isAvailable} variant="detailed" />
              <Badge 
                variant="outline" 
                className={getCategoryColor(book.category)}
              >
                <Tag className="mr-1 h-3 w-3" />
                {book.category}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {canDelete && onDelete && (
              <Button 
                variant="destructive" 
                onClick={() => onDelete(book)}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Book Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Author</p>
                <p className="text-base text-gray-900">{book.author}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Publication Year</p>
                <p className="text-base text-gray-900">{book.publicationYear}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Book ID</p>
                <p className="text-base text-gray-900">#{book.bookId}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className="text-base text-gray-900">
                  {book.isAvailable ? 'Available for borrowing' : 'Currently borrowed'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Borrowing Actions */}
        {(canBorrow || canReturn) && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div className="flex gap-3">
              {canBorrow && book.isAvailable && onBorrow && (
                <Button 
                  onClick={() => onBorrow(book)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Borrow This Book
                </Button>
              )}

              {canReturn && !book.isAvailable && onReturn && (
                <Button 
                  onClick={() => onReturn(book)}
                  disabled={isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Return This Book
                </Button>
              )}

              {!book.isAvailable && !canReturn && (
                <div className="flex-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600 text-center">
                    This book is currently borrowed and not available.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};