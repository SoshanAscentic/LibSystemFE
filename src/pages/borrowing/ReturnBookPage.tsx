import React, { useState } from 'react';
import { BorrowingController } from '../../application/controllers/BorrowingController';
import { ReturnBookDto } from '../../domain/dtos/BorrowingDto';
import { BorrowingRecord } from '../../domain/entities/BorrowingRecord';
import { ReturnBookForm } from '../../components/organisms/ReturnBookForm';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useActiveBorrowings } from '../../presentation/hooks/Borrowing/useActiveBorrowings';

interface ReturnBookPageProps {
  controller: BorrowingController;
}

export const ReturnBookPage: React.FC<ReturnBookPageProps> = ({ controller }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<BorrowingRecord | null>(null);

  // Data hooks
  const { activeBorrowings, isLoading: borrowingsLoading, refresh } = useActiveBorrowings();

  const handleBack = () => {
    controller.handleNavigateToBorrowings();
  };

  const handleSubmit = async (data: ReturnBookDto) => {
    setIsSubmitting(true);
    
    const result = await controller.handleReturnBook(data);
    
    setIsSubmitting(false);
    
    if (result.success) {
      // Refresh the borrowings list
      await refresh();
      // Navigation back to borrowings is handled by the controller
      handleBack();
    }
  };

  const handleSelectBorrowing = (borrowing: BorrowingRecord) => {
    setSelectedBorrowing(borrowing);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Borrowing
        </Button>
      </div>

      {/* Form */}
      <ReturnBookForm
        onSubmit={handleSubmit}
        onCancel={handleBack}
        isLoading={isSubmitting}
        activeBorrowings={activeBorrowings}
        isLoadingBorrowings={borrowingsLoading}
        selectedBorrowing={selectedBorrowing}
        onSelectBorrowing={handleSelectBorrowing}
      />
    </div>
  );
};