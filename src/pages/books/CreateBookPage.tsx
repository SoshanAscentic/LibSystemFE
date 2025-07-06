import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBook } from '../../hooks/api/useBooks';
import { CreateBookDto } from '../../services/api/types';
import { BookForm } from '../../components/organisms/BookForm';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const CreateBookPage: React.FC = () => {
  const navigate = useNavigate();
  const createBookMutation = useCreateBook();

  const handleBack = () => {
    navigate('/books');
  };

  const handleSubmit = async (data: CreateBookDto) => {
    try {
      const result = await createBookMutation.mutateAsync(data);
      navigate(`/books/${result.data.bookId}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Books
        </Button>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <BookForm
          onSubmit={handleSubmit}
          onCancel={handleBack}
          isLoading={createBookMutation.isPending}
          title="Add New Book"
          submitText="Add Book"
        />
      </div>
    </div>
  );
};