import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBook } from '../../hooks/api/useBooks';
import { BookDetails } from '../../components/organisms/BookDetails';
import { LoadingState } from '../../components/molecules/LoadingState';
import { EmptyState } from '../../components/molecules/EmptyState';
import { Button } from '../../components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Book } from '../../services/api/types';
import { useUserPermissions } from '../../hooks/useUserPermissions'; 

export const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookId = parseInt(id || '0', 10);

  const { data: book, isLoading, error } = useBook(bookId);
  const permissions = useUserPermissions(); 

  const handleBack = () => {
    navigate('/books');
  };

  const handleEdit = (book: Book) => {
    navigate(`/books/${book.bookId}/edit`);
  };

  const handleDelete = (book: Book) => {
    // Implement delete logic
    console.log('Delete book:', book);
  };

  const handleBorrow = (book: Book) => {
    // Navigate to borrow page
    navigate(`/borrowing/borrow?bookId=${book.bookId}`);
  };

  if (isLoading) {
    return <LoadingState message="Loading book details..." />;
  }

  if (error || !book) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Button>
        
        <EmptyState
          icon={<BookOpen />}
          title="Book not found"
          description="The book you're looking for doesn't exist or has been removed."
          action={{
            label: "Return to Books",
            onClick: handleBack
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Button>
      </div>

      {/* Book Details */}
      <BookDetails
        book={book}
        onEdit={permissions.canEdit ? handleEdit : undefined}
        onDelete={permissions.canDelete ? handleDelete : undefined}
        onBorrow={permissions.canBorrow ? handleBorrow : undefined}
        canEdit={permissions.canEdit}
        canDelete={permissions.canDelete}
        canBorrow={permissions.canBorrow}
      />
    </div>
  );
};