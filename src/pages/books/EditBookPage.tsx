import React, { useState } from 'react';
import { BooksController } from '../../application/controllers/BooksController';
import { CreateBookDto } from '../../domain/dtos/CreateBookDto';
import { BookForm } from '../../components/organisms/BookForm';
import { LoadingState } from '../../components/molecules/LoadingState';
import { EmptyState } from '../../components/molecules/EmptyState';
import { Button } from '../../components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useBook } from '../../presentation/hooks/useBook';
import { bookToCreateBookDto } from '../../utils/bookUtils';

interface EditBookPageProps {
  bookId: number;
  controller: BooksController;
}

export const EditBookPage: React.FC<EditBookPageProps> = ({ bookId, controller }) => {
  const { book, isLoading, error } = useBook(bookId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    controller.handleViewBook(book!);
  };

  const handleSubmit = async (data: CreateBookDto) => {
    setIsSubmitting(true);
    const result = await controller.handleUpdateBook(bookId, {
      ...data,
      bookId
    });
    setIsSubmitting(false);
    
    if (result.success) {
      handleBack();
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading book..." />;
  }

  if (error || !book) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => controller.handleNavigateToBooks()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Button>
        
        <EmptyState
          icon={<BookOpen />}
          title="Book not found"
          description="The book you're trying to edit doesn't exist."
          action={{
            label: "Return to Books",
            onClick: () => controller.handleNavigateToBooks()
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
          Back to Book Details
        </Button>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <BookForm
          initialData={bookToCreateBookDto(book)}
          onSubmit={handleSubmit}
          onCancel={handleBack}
          isLoading={isSubmitting}
          title={`Edit "${book.title}"`}
          submitText="Update Book"
        />
      </div>
    </div>
  );
};