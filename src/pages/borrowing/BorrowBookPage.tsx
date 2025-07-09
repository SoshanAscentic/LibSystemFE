import React, { useState } from 'react';
import { BorrowingController } from '../../application/controllers/BorrowingController';
import { BorrowBookDto } from '../../domain/dtos/BorrowingDto';
import { Book } from '../../domain/entities/Book';
import { Member } from '../../domain/entities/Member';
import { BorrowBookForm } from '../../components/organisms/BorrowBookForm';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useBooks } from '../../presentation/hooks/Books/useBooks';
import { useMembers } from '../../presentation/hooks/Members/useMembers';
import { useMemberBorrowingStatus } from '../../presentation/hooks/Borrowing/useMemberBorrowingStatus';

interface BorrowBookPageProps {
  controller: BorrowingController;
}

export const BorrowBookPage: React.FC<BorrowBookPageProps> = ({ controller }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Data hooks
  const { books, isLoading: booksLoading } = useBooks({ isAvailable: true });
  const { members, isLoading: membersLoading } = useMembers();
  const { status: memberStatus } = useMemberBorrowingStatus(selectedMember?.memberId);

  const handleBack = () => {
    controller.handleNavigateToBorrowings();
  };

  const handleSubmit = async (data: BorrowBookDto) => {
    setIsSubmitting(true);
    
    const result = await controller.handleBorrowBook(data);
    
    setIsSubmitting(false);
    
    if (result.success) {
      // Navigation back to borrowings is handled by the controller
      handleBack();
    }
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
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
      <BorrowBookForm
        onSubmit={handleSubmit}
        onCancel={handleBack}
        isLoading={isSubmitting}
        availableBooks={books.filter(book => book.isAvailable)}
        activeMembers={members.filter(member => member.isActive)}
        isLoadingBooks={booksLoading}
        isLoadingMembers={membersLoading}
        selectedBook={selectedBook}
        selectedMember={selectedMember}
        memberBorrowingStatus={memberStatus ? {
          canBorrowBooks: memberStatus.canBorrowBooks,
          canBorrowMoreBooks: memberStatus.canBorrowMoreBooks,
          borrowedBooksCount: memberStatus.borrowedBooksCount,
          maxBooksAllowed: memberStatus.maxBooksAllowed,
          overdueBorrowings: memberStatus.overdueBorrowings.length
        } : undefined}
      />
    </div>
  );
};