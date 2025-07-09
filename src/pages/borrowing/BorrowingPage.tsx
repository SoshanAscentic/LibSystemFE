//src/pages/borrowing/BorrowingPage.tsx
import React, { useState } from 'react';
import { BorrowingController } from '../../application/controllers/BorrowingController';
import { BorrowingRecord, BorrowingStatistics } from '../../domain/entities/BorrowingRecord';
import { BorrowingFilters as BorrowingFiltersType, BorrowingSorting, BorrowingPagination } from '../../domain/dtos/BorrowingDto';
import { BorrowingTable } from '../../components/organisms/BorrowingTable';
import { OverdueItemsAlert } from '../../components/organisms/OverdueItemsAlert';
import { StatsCard } from '../../components/molecules/StatsCard';
import { LoadingState } from '../../components/molecules/LoadingState';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { BookOpen, RotateCcw, Plus, BarChart3, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { useBorrowings } from '../../presentation/hooks/Borrowing/useBorrowings';
import { useOverdueRecords } from '../../presentation/hooks/Borrowing/useOverdueRecords';
import { useBorrowingStatistics } from '../../presentation/hooks/Borrowing/useBorrowingStatistics';
import { useUserPermissions } from '../../hooks/useUserPermissions';

type ModalType = 'view-borrowing' | null;

interface ModalState {
  type: ModalType;
  borrowing?: BorrowingRecord;
}

interface BorrowingPageProps {
  controller: BorrowingController;
}

export const BorrowingPage: React.FC<BorrowingPageProps> = ({ controller }) => {
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
  const { borrowings, isLoading: borrowingsLoading, refresh: refreshBorrowings } = useBorrowings(filters, sorting);
  const { overdueRecords, isLoading: overdueLoading } = useOverdueRecords();
  const { statistics, isLoading: statsLoading } = useBorrowingStatistics();

  // Event Handlers
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

  const handleNavigateToBorrow = () => {
    controller.handleNavigateToBorrowBook();
  };

  const handleNavigateToReturn = () => {
    controller.handleNavigateToReturnBook();
  };

  const handleViewAllOverdue = () => {
    setFilters({ isOverdue: true });
  };

  const closeModal = () => {
    setModal({ type: null });
  };

  const isLoading = borrowingsLoading || overdueLoading || statsLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Borrowing Management</h1>
          <p className="text-gray-600 mt-1">
            Manage book borrowings and returns
          </p>
        </div>

        <div className="flex items-center gap-3">
          {permissions.canBorrow && (
            <>
              <Button onClick={handleNavigateToBorrow} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Borrow Book
              </Button>
              <Button variant="outline" onClick={handleNavigateToReturn} className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Return Book
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatsCard
            title="Total Borrowings"
            value={statistics.totalBorrowings}
            icon={<BookOpen className="w-5 h-5" />}
            color="blue"
          />
          <StatsCard
            title="Active Borrowings"
            value={statistics.activeBorrowings}
            icon={<Clock className="w-5 h-5" />}
            color="green"
          />
          <StatsCard
            title="Overdue Books"
            value={statistics.overdueBorrowings}
            icon={<AlertTriangle className="w-5 h-5" />}
            color="red"
          />
          <StatsCard
            title="Returned Books"
            value={statistics.totalReturned}
            icon={<CheckCircle className="w-5 h-5" />}
            color="purple"
          />
          <StatsCard
            title="Total Late Fees"
            value={`$${statistics.totalLateFees.toFixed(2)}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="orange"
          />
        </div>
      )}

      {/* Overdue Alert */}
      {overdueRecords.length > 0 && (
        <OverdueItemsAlert
          overdueItems={overdueRecords}
          onViewItem={handleBorrowingView}
          onReturnItem={permissions.canBorrow ? handleBorrowingReturn : undefined}
          onViewAllOverdue={handleViewAllOverdue}
          showActions={true}
          maxItemsToShow={3}
        />
      )}

      {/* Main Content */}
      <BorrowingTable
        borrowings={borrowings}
        filters={filters}
        sorting={sorting}
        onFiltersChange={handleFiltersChange}
        onSortingChange={handleSortingChange}
        onClearFilters={handleClearFilters}
        onBorrowingView={handleBorrowingView}
        onBorrowingReturn={permissions.canBorrow ? handleBorrowingReturn : undefined}
        isLoading={isLoading}
        showFilters={true}
        showMemberInfo={true}
        showBookInfo={true}
        canReturn={permissions.canBorrow}
        emptyMessage="No borrowing records found"
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
              {/* Borrowing details content would go here */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">{modal.borrowing.bookTitle}</h3>
                <p className="text-sm text-gray-600">by {modal.borrowing.bookAuthor}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Borrowed by: {modal.borrowing.memberName} ({modal.borrowing.memberEmail})
                </p>
                {/* Add more details as needed */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};