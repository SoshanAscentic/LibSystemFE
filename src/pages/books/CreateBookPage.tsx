//src/pages/books/CreateBookPage.tsx
import React, { useState } from 'react';
import { BooksController } from '../../application/controllers/BooksController';
import { CreateBookDto } from '../../domain/dtos/CreateBookDto';
import { BookForm } from '../../components/organisms/BookForm';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CreateBookPageProps {
  controller: BooksController;
}

export const CreateBookPage: React.FC<CreateBookPageProps> = ({ controller }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    controller.handleNavigateToBooks();
  };

  const handleSubmit = async (data: CreateBookDto) => {
    setIsSubmitting(true);
    const result = await controller.handleCreateBook(data);
    setIsSubmitting(false);
    
    // Navigation is handled by the controller
    if (!result.success) {
      // Error handling is done by the controller via notifications
      console.error('Book creation failed:', result.error);
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
      <div className="max-w-2xl mx-auto">
        <BookForm
          onSubmit={handleSubmit}
          onCancel={handleBack}
          isLoading={isSubmitting}
          title="Add New Book"
          submitText="Add Book"
        />
      </div>
    </div>
  );
};