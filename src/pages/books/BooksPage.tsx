import React, { useState } from 'react';
import { BooksController } from '../../application/controllers/BooksController';
import { Book } from '../../domain/entities/Book';
import { BookFilters as BookFiltersType } from '../../domain/valueObjects/BookFilters';
import { CreateBookDto } from '../../domain/dtos/CreateBookDto';
import { BooksGrid } from '../../components/organisms/BooksGrid';
import { BooksTable } from '../../components/organisms/BooksTable';
import { BookForm } from '../../components/organisms/BookForm';
import { BookDetails } from '../../components/organisms/BookDetails';
import { SearchBar } from '../../components/molecules/SearchBar';
import { BookSearchResults } from '../../components/molecules/BookSearchResults';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Grid, List, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useBooks } from '../../presentation/hooks/useBooks';
import { useBooksSearch } from '../../presentation/hooks/useBooksSearch';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import { bookToCreateBookDto } from '../../utils/bookUtils';

type ViewMode = 'grid' | 'table';
type ModalType = 'add' | 'edit' | 'view' | 'delete' | null;

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
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Permissions
  const permissions = useUserPermissions();

  // Data hooks
  const { books, isLoading: booksLoading, refresh: refreshBooks } = useBooks(filters);
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasSearchQuery,
    clearSearch
  } = useBooksSearch();

  // Event Handlers
  const handleFiltersChange = (newFilters: Partial<BookFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleSearchToggle = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      clearSearch();
    }
  };

  const handleBookView = (book: Book) => {
    setModal({ type: 'view', book });
  };

  const handleBookEdit = (book: Book) => {
    setModal({ type: 'edit', book });
  };

  const handleBookDelete = (book: Book) => {
    setModal({ type: 'delete', book });
  };

  const handleBookAdd = () => {
    setModal({ type: 'add' });
  };

  const handleBookBorrow = (book: Book) => {
    // Will be implemented in Phase 6
    controller.handleNavigateToBooks();
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

  const handleUpdateBook = async (data: CreateBookDto) => {
    if (!modal.book) return;
    
    setIsSubmitting(true);
    
    const result = await controller.handleUpdateBook(modal.book.bookId, {
      ...data,
      bookId: modal.book.bookId
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      setModal({ type: null });
      refreshBooks();
    }
  };

  const handleConfirmDelete = async () => {
    if (!modal.book) return;
    
    setIsSubmitting(true);
    
    const result = await controller.handleDeleteBook(modal.book);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setModal({ type: null });
      refreshBooks();
    }
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setModal({ type: null });
    }
  };

  const currentBooks = isSearchMode && hasSearchQuery ? searchResults : books;
  const isLoading = isSearchMode ? isSearching : booksLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Books</h1>
          <p className="text-gray-600 mt-1">
            Manage your library's book collection
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Toggle */}
          <Button
            variant={isSearchMode ? 'default' : 'outline'}
            onClick={handleSearchToggle}
          >
            {isSearchMode ? <X className="mr-2 h-4 w-4" /> : <Search className="mr-2 h-4 w-4" />}
            {isSearchMode ? 'Exit Search' : 'Search'}
          </Button>

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

      {/* Search Bar */}
      {isSearchMode && (
        <Card className="p-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search books by title, author, or category..."
            className="mb-4"
          />
          
          {hasSearchQuery && (
            <BookSearchResults
              results={searchResults}
              isLoading={isSearching}
              hasSearchQuery={hasSearchQuery}
              searchQuery={searchQuery}
              onBookView={handleBookView}
              onBookEdit={permissions.canEdit ? handleBookEdit : undefined}
              onBookDelete={permissions.canDelete ? handleBookDelete : undefined}
              onBookBorrow={permissions.canBorrow ? handleBookBorrow : undefined}
              canEdit={permissions.canEdit}
              canDelete={permissions.canDelete}
              canBorrow={permissions.canBorrow}
            />
          )}
        </Card>
      )}

      {/* Main Content */}
      {!isSearchMode && (
        <>
          {viewMode === 'grid' ? (
            <BooksGrid
              books={currentBooks}
              isLoading={isLoading}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              onBookView={handleBookView}
              onBookEdit={permissions.canEdit ? handleBookEdit : undefined}
              onBookDelete={permissions.canDelete ? handleBookDelete : undefined}
              onBookBorrow={permissions.canBorrow ? handleBookBorrow : undefined}
              onAddBook={permissions.canAdd ? handleBookAdd : undefined}
              canEdit={permissions.canEdit}
              canDelete={permissions.canDelete}
              canBorrow={permissions.canBorrow}
              canAdd={permissions.canAdd}
            />
          ) : (
            <BooksTable
              books={currentBooks}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onBookView={handleBookView}
              onBookEdit={permissions.canEdit ? handleBookEdit : undefined}
              onBookDelete={permissions.canDelete ? handleBookDelete : undefined}
              onBookBorrow={permissions.canBorrow ? handleBookBorrow : undefined}
              canEdit={permissions.canEdit}
              canDelete={permissions.canDelete}
              canBorrow={permissions.canBorrow}
            />
          )}
        </>
      )}

      {/* Modals */}
      
      {/* Add/Edit Book Modal */}
      <Dialog open={modal.type === 'add' || modal.type === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modal.type === 'add' ? 'Add New Book' : 'Edit Book'}
            </DialogTitle>
          </DialogHeader>
          <BookForm
            initialData={modal.book ? bookToCreateBookDto(modal.book) : undefined}
            onSubmit={modal.type === 'add' ? handleCreateBook : handleUpdateBook}
            onCancel={closeModal}
            isLoading={isSubmitting}
            title={modal.type === 'add' ? 'Add New Book' : 'Edit Book'}
            submitText={modal.type === 'add' ? 'Add Book' : 'Update Book'}
          />
        </DialogContent>
      </Dialog>

      {/* View Book Modal */}
      <Dialog open={modal.type === 'view'} onOpenChange={closeModal}>
        <DialogContent className="max-w-3xl">
          {modal.book && (
            <BookDetails
              book={modal.book}
              onEdit={permissions.canEdit ? handleBookEdit : undefined}
              onDelete={permissions.canDelete ? handleBookDelete : undefined}
              onBorrow={permissions.canBorrow ? handleBookBorrow : undefined}
              canEdit={permissions.canEdit}
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