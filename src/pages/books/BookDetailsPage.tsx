import React from 'react';
import { BooksController } from '../../application/controllers/BooksController';
import { BookDetails } from '../../components/organisms/BookDetails';
import { LoadingState } from '../../components/molecules/LoadingState';
import { EmptyState } from '../../components/molecules/EmptyState';
import { Button } from '../../components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useBook } from '../../presentation/hooks/useBook';
import { useUserPermissions } from '../../hooks/useUserPermissions';

interface BookDetailsPageProps {
  bookId: number;
  controller: BooksController;
}

export const BookDetailsPage: React.FC<BookDetailsPageProps> = ({ bookId, controller }) => {
  const { book, isLoading, error } = useBook(bookId);
  const permissions = useUserPermissions();

  const handleBack = () => {
    controller.handleNavigateBack();
  };

  const handleEdit = () => {
    if (book) {
      // Navigate to edit page - this could be enhanced
      controller.handleNavigateToBooks();
    }
  };

  const handleDelete = async () => {
    if (book) {
      await controller.handleDeleteBook(book);
    }
  };

  const handleBorrow = () => {
    if (book) {
      // Will be implemented in Phase 6
      console.log('Borrow book:', book);
    }
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