import React, { useState } from 'react';
import { useBooks } from '../../hooks/api/useBooks';
import { useBooksSearch } from '../../hooks/api/useBooksSearch';
import { useCreateBook, useUpdateBook, useDeleteBook } from '../../hooks/api/useBooks';
import { BookFilters as BookFiltersType, CreateBookDto, Book } from '../../services/api/types';
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
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { useUserPermissions } from '../../hooks/useUserPermissions';
import { bookToCreateBookDto } from '../../utils/bookUtils'; // Import the transformer

type ViewMode = 'grid' | 'table';
type ModalType = 'add' | 'edit' | 'view' | 'delete' | null;

interface ModalState {
  type: ModalType;
  book?: Book;
}

export const BooksPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<BookFiltersType>({});
  const [modal, setModal] = useState<ModalState>({ type: null });
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Get user permissions
  const permissions = useUserPermissions();

  // API hooks
  const { data: books = [], isLoading: booksLoading } = useBooks(filters);
  const createBookMutation = useCreateBook();
  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();

  // Search functionality
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    hasSearchQuery,
    filters: searchFilters,
    updateFilters: updateSearchFilters,
    clearFilters: clearSearchFilters
  } = useBooksSearch();

  // Handlers
  const handleFiltersChange = (newFilters: Partial<BookFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleSearchToggle = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      setSearchQuery('');
      clearSearchFilters();
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
    // Navigate to borrowing page or open borrow modal
    toast.info(`Borrowing functionality for "${book.title}" will be implemented in Phase 6`);
  };

  const handleCreateBook = async (data: CreateBookDto) => {
    try {
      await createBookMutation.mutateAsync(data);
      setModal({ type: null });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdateBook = async (data: CreateBookDto) => {
    if (!modal.book) return;
    
    try {
      await updateBookMutation.mutateAsync({ 
        id: modal.book.bookId, 
        data 
      });
      setModal({ type: null });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleConfirmDelete = async () => {
    if (!modal.book) return;
    
    try {
      await deleteBookMutation.mutateAsync(modal.book.bookId);
      setModal({ type: null });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const closeModal = () => {
    setModal({ type: null });
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
      
      {/* Add/Edit Book Modal - FIXED */}
      <Dialog open={modal.type === 'add' || modal.type === 'edit'} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modal.type === 'add' ? 'Add New Book' : 'Edit Book'}
            </DialogTitle>
          </DialogHeader>
          <BookForm
            initialData={modal.book ? bookToCreateBookDto(modal.book) : undefined} // ✅ FIXED: Transform Book to CreateBookDto
            onSubmit={modal.type === 'add' ? handleCreateBook : handleUpdateBook}
            onCancel={closeModal}
            isLoading={createBookMutation.isPending || updateBookMutation.isPending}
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
        isLoading={deleteBookMutation.isPending}
        variant="destructive"
      />
    </div>
  );
};