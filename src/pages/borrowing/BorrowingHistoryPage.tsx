import React, { useState } from 'react';
import { BorrowingController } from '../../application/controllers/BorrowingController';
import { BorrowingFilters as BorrowingFiltersType, BorrowingSorting } from '../../domain/dtos/BorrowingDto';
import { BorrowingRecord } from '../../domain/entities/BorrowingRecord';
import { BorrowingHistory } from '../../components/organisms/BorrowingHistory';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ArrowLeft } from 'lucide-react';
import { useBorrowings } from '../../presentation/hooks/Borrowing/useBorrowings';
import { useUserPermissions } from '../../hooks/useUserPermissions';

type ModalType = 'view-borrowing' | null;

interface ModalState {
  type: ModalType;
  borrowing?: BorrowingRecord;
}

interface BorrowingHistoryPageProps {
  controller: BorrowingController;
}

export const BorrowingHistoryPage: React.FC<BorrowingHistoryPageProps> = ({ controller }) => {
  // UI State
  const [filters, setFilters] = useState<BorrowingFiltersType>({});
  const [sorting, setSorting] = useState<BorrowingSorting>({ 
    sortBy: 'borrowedAt', 
    sortDirection: 'desc' 
  });
  const [modal, setModal] = useState<ModalState>({ type: null });

  // Permissions
  const permissions = useUserPermissions();

  // Data hooks
  const { borrowings, isLoading, refresh } = useBorrowings(filters, sorting);

  // Event Handlers
  const handleBack = () => {
    controller.handleNavigateToBorrowings();
  };

  const handleFiltersChange = (newFilters: Partial<BorrowingFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortingChange = (newSorting: BorrowingSorting) => {
    setSorting(newSorting);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSorting({ sortBy: 'borrowedAt', sortDirection: 'desc' });
  };

  const handleBorrowingView = (borrowing: BorrowingRecord) => {
    setModal({ type: 'view-borrowing', borrowing });
  };

  const handleBorrowingReturn = async (borrowing: BorrowingRecord) => {
    // Navigate to return book page with pre-selected borrowing
    controller.handleNavigateToReturnBook();
  };

  const handleExportData = () => {
    // Implementation for exporting borrowing history data
    const csvData = borrowings.map(borrowing => ({
      'Borrowing ID': borrowing.borrowingId,
      'Book Title': borrowing.bookTitle,
      'Book Author': borrowing.bookAuthor,
      'Member Name': borrowing.memberName,
      'Member Email': borrowing.memberEmail,
      'Borrowed Date': borrowing.borrowedAt.toISOString().split('T')[0],
      'Due Date': borrowing.dueDate.toISOString().split('T')[0],
      'Returned Date': borrowing.returnedAt?.toISOString().split('T')[0] || '',
      'Status': borrowing.status,
      'Days Borrowed': borrowing.daysBorrowed,
      'Days Overdue': borrowing.daysOverdue,
      'Late Fee': borrowing.lateFee
    }));

    const csvString = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `borrowing-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const closeModal = () => {
    setModal({ type: null });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Borrowing Dashboard
        </Button>
      </div>

      {/* Borrowing History */}
      <BorrowingHistory
        borrowings={borrowings}
        filters={filters}
        sorting={sorting}
        onFiltersChange={handleFiltersChange}
        onSortingChange={handleSortingChange}
        onClearFilters={handleClearFilters}
        onBorrowingView={handleBorrowingView}
        onBorrowingReturn={permissions.canBorrow ? handleBorrowingReturn : undefined}
        onExportData={handleExportData}
        isLoading={isLoading}
        showFilters={true}
        showMemberInfo={true}
        showBookInfo={true}
        canReturn={permissions.canBorrow}
        title="Complete Borrowing History"
      />

      {/* View Borrowing Modal */}
      <Dialog open={modal.type === 'view-borrowing'} onOpenChange={closeModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Borrowing Details
            </DialogTitle>
          </DialogHeader>
          {modal.borrowing && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">{modal.borrowing.bookTitle}</h3>
                <p className="text-sm text-gray-600">by {modal.borrowing.bookAuthor}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Borrowed by: {modal.borrowing.memberName} ({modal.borrowing.memberEmail})
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <span className="text-gray-600">Borrowed:</span>
                    <span className="ml-2 font-medium">{modal.borrowing.borrowedAt.toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Due:</span>
                    <span className="ml-2 font-medium">{modal.borrowing.dueDate.toLocaleDateString()}</span>
                  </div>
                  {modal.borrowing.returnedAt && (
                    <div>
                      <span className="text-gray-600">Returned:</span>
                      <span className="ml-2 font-medium">{modal.borrowing.returnedAt.toLocaleDateString()}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium">{modal.borrowing.status}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};