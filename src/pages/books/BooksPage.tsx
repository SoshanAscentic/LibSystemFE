import React, { useState } from 'react';
import { BooksController } from '../../application/controllers/BooksController';
import { Book } from '../../domain/entities/Book';
import { BookFilters as BookFiltersType } from '../../domain/valueObjects/BookFilters';
import { CreateBookDto } from '../../domain/dtos/CreateBookDto';
import { BooksGrid } from '../../components/organisms/BooksGrid';
import { BooksTable } from '../../components/organisms/BooksTable';
import { BookForm } from '../../components/organisms/BookForm';
import { BookDetails } from '../../components/organisms/BookDetails';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Grid, List, Plus } from 'lucide-react';
import { useBooks } from '../../presentation/hooks/Books/useBooks';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import { bookToCreateBookDto } from '../../utils/bookUtils';

type ViewMode = 'grid' | 'table';
type ModalType = 'add' | 'view' | 'delete' | null;

interface ModalState {
  type: ModalType;
  book?: Book;
}

interface BooksPageProps {
  controller: BooksController;
}

export const BooksPage: React.FC<BooksPageProps> = ({ controller }) => {
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<BookFiltersType>({});
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permissions - Using actual auth context
  const permissions = useUserPermissions();

  // Data hooks
  const { books, isLoading: booksLoading, refresh: refreshBooks } = useBooks(filters);

  // Event Handlers
  const handleFiltersChange = (newFilters: Partial<BookFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleBookView = (book: Book) => {
    setModal({ type: 'view', book });
  };

  const handleBookDelete = (book: Book) => {
    setModal({ type: 'delete', book });
  };

  const handleBookAdd = () => {
    // Double-check permission before allowing add
    if (!permissions.canAdd) {
      console.warn('User attempted to add book without permission');
      return;
    }
    setModal({ type: 'add' });
  };

  // Replace the existing handleBookBorrow function with this:
  const handleBookBorrow = (book: Book) => {
    // Check permission before allowing borrow
    if (!permissions.canBorrow) {
      console.warn('User attempted to borrow book without permission');
      return;
    }
    
    console.log('BooksPage: Borrowing book:', book.title);
    controller.handleBorrowBook(book);
  };

  const handleCreateBook = async (data: CreateBookDto) => {
    setIsSubmitting(true);
    
    const result = await controller.handleCreateBook(data);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setModal({ type: null });
      refreshBooks();
    }
  };

  const handleConfirmDelete = async () => {
    if (!modal.book) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Deleting book:', modal.book.bookId, modal.book.title);
      
      // Attempt the delete
      const result = await controller.handleDeleteBook(modal.book);
      
      console.log('Delete result:', result);
      
      // Always close modal and refresh - the controller handles notifications
      setModal({ type: null });
      
      // Force refresh the books list
      console.log('Refreshing books list...');
      await refreshBooks();
      console.log('Books refreshed');
      
    } catch (error) {
      console.error('Unexpected error during delete:', error);
      // Only show error notification for unexpected errors
      setModal({ type: null });
      await refreshBooks();
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setModal({ type: null });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Library</h1>
          <p className="text-gray-600 mt-1">
            Manage your library's book collection
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Conditional Add Book button in header */}
          {permissions.canAdd && (
            <Button onClick={handleBookAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Book
            </Button>
          )}

          {/* View Mode Toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'grid' ? (
        <BooksGrid
          books={books}
          isLoading={booksLoading}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onBookView={handleBookView}
          onBookDelete={permissions.canDelete ? handleBookDelete : undefined}
          onBookBorrow={permissions.canBorrow ? handleBookBorrow : undefined}
          onAddBook={permissions.canAdd ? handleBookAdd : undefined}
          canDelete={permissions.canDelete}
          canBorrow={permissions.canBorrow}
          canAdd={permissions.canAdd}
        />
      ) : (
        <BooksTable
          books={books}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onBookView={handleBookView}
          onBookDelete={permissions.canDelete ? handleBookDelete : undefined}
          onBookBorrow={permissions.canBorrow ? handleBookBorrow : undefined}
          onAddBook={permissions.canAdd ? handleBookAdd : undefined}
          canDelete={permissions.canDelete}
          canBorrow={permissions.canBorrow}
          canAdd={permissions.canAdd}
        />
      )}

      {/* Modals */}
      
      {/* Add Book Modal */}
      <Dialog open={modal.type === 'add'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
          </DialogHeader>
          
          {/* Permission check - Don't render add form if user doesn't have permission */}
          {permissions.canAdd && (
            <BookForm
              onSubmit={handleCreateBook}
              onCancel={closeModal}
              isLoading={isSubmitting}
              title="Add New Book"
              submitText="Add Book"
            />
          )}
          
          {/* Show error if user somehow gets to add modal without permission */}
          {!permissions.canAdd && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">You don't have permission to add books.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

     {/* View Book Modal */}
      <Dialog open={modal.type === 'view'} onOpenChange={closeModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {modal.book ? `${modal.book.title} - Book Details` : 'Book Details'}
            </DialogTitle>
          </DialogHeader>
          {modal.book && (
            <BookDetails
              book={modal.book}
              onDelete={permissions.canDelete ? handleBookDelete : undefined}
              onBorrow={permissions.canBorrow ? handleBookBorrow : undefined}
              canDelete={permissions.canDelete}
              canBorrow={permissions.canBorrow}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={modal.type === 'delete'}
        onOpenChange={(open) => !open && closeModal()}
        onConfirm={handleConfirmDelete}
        title="Delete Book"
        description={
          modal.book
            ? `Are you sure you want to delete "${modal.book.title}" by ${modal.book.author}? This action cannot be undone.`
            : ''
        }
        confirmText="Delete Book"
        isLoading={isSubmitting}
        variant="destructive"
      />
    </div>
  );
};