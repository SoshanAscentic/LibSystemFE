import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBook, useUpdateBook } from '../../hooks/api/useBooks';
import { CreateBookDto } from '../../services/api/types';
import { BookForm } from '../../components/organisms/BookForm';
import { LoadingState } from '../../components/molecules/LoadingState';
import { EmptyState } from '../../components/molecules/EmptyState';
import { Button } from '../../components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { bookToCreateBookDto } from '../../utils/bookUtils';

export const EditBookPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookId = parseInt(id || '0', 10);

  const { data: book, isLoading, error } = useBook(bookId);
  const updateBookMutation = useUpdateBook();

  const handleBack = () => {
    navigate(`/books/${bookId}`);
  };

  const handleSubmit = async (data: CreateBookDto) => {
    try {
      await updateBookMutation.mutateAsync({ id: bookId, data });
      navigate(`/books/${bookId}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading book..." />;
  }

  if (error || !book) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/books')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Button>
        
        <EmptyState
          icon={<BookOpen />}
          title="Book not found"
          description="The book you're trying to edit doesn't exist."
          action={{
            label: "Return to Books",
            onClick: () => navigate('/books')
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
          isLoading={updateBookMutation.isPending}
          title={`Edit "${book.title}"`}
          submitText="Update Book"
        />
      </div>
    </div>
  );
};