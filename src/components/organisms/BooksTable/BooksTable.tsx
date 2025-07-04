import React from 'react';
import { Book, BookFilters } from '../../../services/api/types';
import { BookStatusBadge } from '../../molecules/BookStatusBadge';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, BookOpen, ArrowUpDown } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface BooksTableProps {
  books: Book[];
  filters: BookFilters;
  onFiltersChange: (filters: Partial<BookFilters>) => void;
  onBookView?: (book: Book) => void;
  onBookEdit?: (book: Book) => void;
  onBookDelete?: (book: Book) => void;
  onBookBorrow?: (book: Book) => void;
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

export const BooksTable: React.FC<BooksTableProps> = ({
  books,
  filters,
  onFiltersChange,
  onBookView,
  onBookEdit,
  onBookDelete,
  onBookBorrow,
  canEdit = false,
  canDelete = false,
  canBorrow = false,
  className
}) => {
  const handleSort = (field: 'title' | 'author' | 'publicationYear' | 'category') => {
    const isCurrentField = filters.sortBy === field;
    const newDirection = isCurrentField && filters.sortDirection === 'asc' ? 'desc' : 'asc';
    
    onFiltersChange({
      sortBy: field,
      sortDirection: newDirection
    });
  };

  const getSortIcon = (field: string) => {
    if (filters.sortBy === field) {
      return (
        <ArrowUpDown 
          className={cn(
            'ml-1 h-4 w-4',
            filters.sortDirection === 'desc' && 'rotate-180'
          )} 
        />
      );
    }
    return <ArrowUpDown className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-50" />;
  };

  return (
    <Card className={className}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('title')}
                  className="group h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                >
                  Title
                  {getSortIcon('title')}
                </Button>
              </th>
              <th className="px-6 py-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('author')}
                  className="group h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                >
                  Author
                  {getSortIcon('author')}
                </Button>
              </th>
              <th className="px-6 py-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('publicationYear')}
                  className="group h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                >
                  Year
                  {getSortIcon('publicationYear')}
                </Button>
              </th>
              <th className="px-6 py-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('category')}
                  className="group h-auto p-0 font-medium text-gray-700 hover:text-gray-900"
                >
                  Category
                  {getSortIcon('category')}
                </Button>
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {books.map((book) => (
              <tr 
                key={book.bookId} 
                className={cn(
                  'hover:bg-gray-50',
                  !book.isAvailable && 'opacity-75'
                )}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{book.title}</p>
                    <p className="text-sm text-gray-500">ID: #{book.bookId}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {book.author}
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {book.publicationYear}
                </td>
                <td className="px-6 py-4">
                  <Badge 
                    variant="outline" 
                    className={getCategoryColor(book.category)}
                  >
                    {book.category}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <BookStatusBadge isAvailable={book.isAvailable} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {canBorrow && book.isAvailable && onBookBorrow && (
                      <Button
                        size="sm"
                        onClick={() => onBookBorrow(book)}
                      >
                        <BookOpen className="mr-1 h-3 w-3" />
                        Borrow
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onBookView && (
                          <DropdownMenuItem onClick={() => onBookView(book)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        )}
                        {canEdit && onBookEdit && (
                          <DropdownMenuItem onClick={() => onBookEdit(book)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Book
                          </DropdownMenuItem>
                        )}
                        {canDelete && onBookDelete && (
                          <DropdownMenuItem 
                            onClick={() => onBookDelete(book)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Book
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {books.length === 0 && (
          <div className="p-8 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No books match your current filters.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};