import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BorrowingController } from '../../application/controllers/BorrowingController';
import { BorrowBookDto } from '../../domain/dtos/BorrowingDto';
import { Book } from '../../domain/entities/Book';
import { Member } from '../../domain/entities/Member';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { SearchBar } from '../../components/molecules/SearchBar';
import { LoadingState } from '../../components/molecules/LoadingState';
import { BookOpen, ArrowLeft, User, Calendar } from 'lucide-react';
import { useBooks } from '../../presentation/hooks/Books/useBooks';
import { useMembers } from '../../presentation/hooks/Members/useMembers';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface BorrowBookPageProps {
  controller: BorrowingController;
}

export const BorrowBookPage: React.FC<BorrowBookPageProps> = ({ controller }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14); // 14 days from now
    return date.toISOString().split('T')[0];
  });

  // Memoize the book filters to prevent re-renders
  const bookFilters = useMemo(() => ({ isAvailable: true }), []);

  // Check if user can select other members
  const canSelectOtherMembers = useMemo(() => 
    user?.role === 'ManagementStaff' || user?.role === 'Administrator', 
    [user?.role]
  );

  // Data hooks with memoized filters
  const { books, isLoading: booksLoading } = useBooks(bookFilters);
  const { members, isLoading: membersLoading } = useMembers();

  // Find current user as member - memoized
  const currentUserAsMember = useMemo(() => 
    members.find(member => member.email === user?.email), 
    [members, user?.email]
  );

  // Set default member
  useEffect(() => {
    if (!canSelectOtherMembers && currentUserAsMember && !selectedMember) {
      setSelectedMember(currentUserAsMember);
    }
  }, [canSelectOtherMembers, currentUserAsMember, selectedMember]);

  // Memoized handlers to prevent re-renders
  const handleBack = useCallback(() => {
    controller.handleNavigateBack();
  }, [controller]);

  const handleSubmit = useCallback(async () => {
    if (!selectedBook || !selectedMember) return;

    setIsSubmitting(true);
    
    try {
      const borrowData: BorrowBookDto = {
        bookId: selectedBook.bookId,
        memberId: selectedMember.memberId,
        dueDate: dueDate
      };

      const result = await controller.handleBorrowBook(borrowData);
      
      if (result.success) {
        handleBack();
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBook, selectedMember, dueDate, controller, handleBack]);

  const handleBookSelect = useCallback((book: Book) => {
    setSelectedBook(book);
  }, []);

  const handleMemberSelect = useCallback((member: Member) => {
    setSelectedMember(member);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleDueDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDueDate(e.target.value);
  }, []);

  // Memoized filtered lists
  const filteredBooks = useMemo(() => 
    books.filter(book => 
      book.isAvailable && (
        searchQuery === '' || 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ), 
    [books, searchQuery]
  );

  const filteredMembers = useMemo(() => 
    members.filter(member =>
      member.isActive && (
        searchQuery === '' ||
        member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ), 
    [members, searchQuery]
  );

  // Show loading state
  if (booksLoading || membersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <LoadingState message="Loading books and members..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Selection (if authorized) */}
        {canSelectOtherMembers && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Select Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search members..."
                className="mb-4"
              />
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredMembers.map((member) => (
                  <div
                    key={member.memberId}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-colors",
                      selectedMember?.memberId === member.memberId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => handleMemberSelect(member)}
                  >
                    <div className="font-medium">{member.fullName}</div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                  </div>
                ))}
                {filteredMembers.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No members found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Book Selection */}
        <Card className={canSelectOtherMembers ? "lg:col-span-2" : "lg:col-span-3"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Select Book to Borrow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search books by title or author..."
              className="mb-4"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredBooks.map((book) => (
                <div
                  key={book.bookId}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-colors",
                    selectedBook?.bookId === book.bookId
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                  onClick={() => handleBookSelect(book)}
                >
                  <div className="font-medium">{book.title}</div>
                  <div className="text-sm text-gray-600">by {book.author}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {book.category} • {book.publicationYear}
                  </div>
                </div>
              ))}
              {filteredBooks.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No available books found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Section */}
      {selectedBook && selectedMember && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Borrowing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Selected Book</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{selectedBook.title}</div>
                  <div className="text-sm text-gray-600">by {selectedBook.author}</div>
                </div>
              </div>
              <div>
                <Label>Selected Member</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{selectedMember.fullName}</div>
                  <div className="text-sm text-gray-600">{selectedMember.email}</div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={handleDueDateChange}
                min={new Date().toISOString().split('T')[0]}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Confirm Borrowing'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};