import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BorrowBookDto } from '../../../domain/dtos/BorrowingDto';
import { Book } from '../../../domain/entities/Book';
import { Member } from '../../../domain/entities/Member';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Alert, AlertDescription } from '../../ui/alert';
import { Textarea } from '../../ui/textarea';
import { SearchBar } from '../../molecules/SearchBar';
import { LoadingState } from '../../molecules/LoadingState';
import { BookOpen, User, Calendar, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useAuth } from '../../../contexts/AuthContext';

interface BorrowBookFormData {
  bookId: string;
  memberId: string;
  dueDate: string;
  notes?: string;
}

interface BorrowBookFormProps {
  onSubmit: (data: BorrowBookDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  availableBooks?: Book[];
  activeMembers?: Member[];
  isLoadingBooks?: boolean;
  isLoadingMembers?: boolean;
  onSearchBooks?: (query: string) => void;
  onSearchMembers?: (query: string) => void;
  selectedBook?: Book | null;
  selectedMember?: Member | null;
  memberBorrowingStatus?: {
    canBorrowBooks: boolean;
    canBorrowMoreBooks: boolean;
    borrowedBooksCount: number;
    maxBooksAllowed: number;
    overdueBorrowings: number;
  } | null;
  className?: string;
}

export const BorrowBookForm: React.FC<BorrowBookFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  availableBooks = [],
  activeMembers = [],
  isLoadingBooks = false,
  isLoadingMembers = false,
  onSearchBooks,
  onSearchMembers,
  selectedBook,
  selectedMember,
  memberBorrowingStatus,
  className
}) => {
  const { user } = useAuth();
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [step, setStep] = useState<'select-member' | 'select-book' | 'confirm'>('select-member');
  const [internalSelectedMember, setInternalSelectedMember] = useState<Member | null>(null);
  const [internalSelectedBook, setInternalSelectedBook] = useState<Book | null>(null);

  // Check if user can select other members
  const canSelectOtherMembers = user?.role === 'ManagementStaff' || user?.role === 'Administrator';

  // Find current user as member
  const currentUserAsMember = activeMembers.find(member => member.email === user?.email);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<BorrowBookFormData>({
    defaultValues: {
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
    }
  });

  const watchedValues = watch();

  // Initialize step based on user permissions
  useEffect(() => {
    if (!canSelectOtherMembers && currentUserAsMember) {
      // Skip member selection for regular members
      setInternalSelectedMember(currentUserAsMember);
      setValue('memberId', currentUserAsMember.memberId.toString());
      setStep('select-book');
    } else {
      setStep('select-member');
    }
  }, [canSelectOtherMembers, currentUserAsMember, setValue]);

  // Auto-advance steps
  useEffect(() => {
    if (step === 'select-member' && internalSelectedMember && watchedValues.memberId) {
      setStep('select-book');
    }
  }, [internalSelectedMember, watchedValues.memberId, step]);

  useEffect(() => {
    if (step === 'select-book' && internalSelectedBook && watchedValues.bookId) {
      setStep('confirm');
    }
  }, [internalSelectedBook, watchedValues.bookId, step]);

  // Set form values when selections change
  useEffect(() => {
    if (internalSelectedMember) {
      setValue('memberId', internalSelectedMember.memberId.toString());
    }
  }, [internalSelectedMember, setValue]);

  useEffect(() => {
    if (internalSelectedBook) {
      setValue('bookId', internalSelectedBook.bookId.toString());
    }
  }, [internalSelectedBook, setValue]);

  const handleFormSubmit = async (data: BorrowBookFormData) => {
    const borrowData: BorrowBookDto = {
      bookId: parseInt(data.bookId),
      memberId: parseInt(data.memberId),
      dueDate: data.dueDate
    };

    await onSubmit(borrowData);
  };

  const handleReset = () => {
    reset();
    setInternalSelectedMember(null);
    setInternalSelectedBook(null);
    setBookSearchQuery('');
    setMemberSearchQuery('');
    
    if (!canSelectOtherMembers && currentUserAsMember) {
      setInternalSelectedMember(currentUserAsMember);
      setValue('memberId', currentUserAsMember.memberId.toString());
      setStep('select-book');
    } else {
      setStep('select-member');
    }
  };

  const handleMemberSelect = (member: Member) => {
    setInternalSelectedMember(member);
    setValue('memberId', member.memberId.toString());
  };

  const handleBookSelect = (book: Book) => {
    setInternalSelectedBook(book);
    setValue('bookId', book.bookId.toString());
  };

  const filteredBooks = availableBooks.filter(book =>
    bookSearchQuery === '' || 
    book.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearchQuery.toLowerCase())
  );

  const filteredMembers = activeMembers.filter(member =>
    memberSearchQuery === '' ||
    member.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  const canProceed = () => {
    if (!internalSelectedMember || !internalSelectedBook) return false;
    if (memberBorrowingStatus && !memberBorrowingStatus.canBorrowMoreBooks) return false;
    return true;
  };

  return (
    <Card className={cn("max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Borrow Book
        </CardTitle>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-4 mt-4">
          {canSelectOtherMembers && (
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
              step === 'select-member' ? "bg-blue-100 text-blue-800" : 
              internalSelectedMember ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
            )}>
              <User className="w-4 h-4" />
              1. Select Member
              {internalSelectedMember && <CheckCircle className="w-4 h-4" />}
            </div>
          )}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            step === 'select-book' ? "bg-blue-100 text-blue-800" : 
            internalSelectedBook ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
          )}>
            <BookOpen className="w-4 h-4" />
            {canSelectOtherMembers ? '2.' : '1.'} Select Book
            {internalSelectedBook && <CheckCircle className="w-4 h-4" />}
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            step === 'confirm' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
          )}>
            <Clock className="w-4 h-4" />
            {canSelectOtherMembers ? '3.' : '2.'} Confirm Details
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Step 1: Select Member (only for staff) */}
          {step === 'select-member' && canSelectOtherMembers && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Select Member</h3>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              </div>

              <SearchBar
                value={memberSearchQuery}
                onChange={setMemberSearchQuery}
                placeholder="Search members by name or email..."
                className="w-full"
              />

              {isLoadingMembers ? (
                <LoadingState message="Loading members..." />
              ) : (
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.memberId}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-colors",
                        internalSelectedMember?.memberId === member.memberId
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                      onClick={() => handleMemberSelect(member)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{member.fullName}</h4>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {member.memberType} • {member.borrowedBooksCount} books borrowed
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {member.isActive ? (
                            <span className="text-green-600 text-xs">Active</span>
                          ) : (
                            <span className="text-red-600 text-xs">Inactive</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredMembers.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No members found
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Book */}
          {step === 'select-book' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Select Book</h3>
                {canSelectOtherMembers && (
                  <Button variant="outline" size="sm" onClick={() => setStep('select-member')}>
                    Change Member
                  </Button>
                )}
              </div>

              {/* Selected Member Info */}
              {internalSelectedMember && (
                <Alert>
                  <User className="w-4 h-4" />
                  <AlertDescription>
                    {canSelectOtherMembers ? 'Selected Member' : 'Borrowing for'}: <strong>{internalSelectedMember.fullName}</strong> ({internalSelectedMember.email})
                  </AlertDescription>
                </Alert>
              )}

              {/* Member Borrowing Status */}
              {memberBorrowingStatus && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Borrowing Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Books Borrowed:</span>
                      <span className="ml-2 font-medium">
                        {memberBorrowingStatus.borrowedBooksCount} / {memberBorrowingStatus.maxBooksAllowed}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Can Borrow More:</span>
                      <span className={cn(
                        "ml-2 font-medium",
                        memberBorrowingStatus.canBorrowMoreBooks ? "text-green-600" : "text-red-600"
                      )}>
                        {memberBorrowingStatus.canBorrowMoreBooks ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  {memberBorrowingStatus.overdueBorrowings > 0 && (
                    <Alert className="mt-3">
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        This member has {memberBorrowingStatus.overdueBorrowings} overdue book(s).
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <SearchBar
                value={bookSearchQuery}
                onChange={setBookSearchQuery}
                placeholder="Search books by title or author..."
                className="w-full"
              />

              {isLoadingBooks ? (
                <LoadingState message="Loading books..." />
              ) : (
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {filteredBooks.map((book) => (
                    <div
                      key={book.bookId}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-colors",
                        internalSelectedBook?.bookId === book.bookId
                          ? "border-blue-500 bg-blue-50"
                          : book.isAvailable 
                            ? "border-gray-200 hover:border-gray-300"
                            : "border-gray-200 bg-gray-50 cursor-not-allowed"
                      )}
                      onClick={() => book.isAvailable && handleBookSelect(book)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{book.title}</h4>
                          <p className="text-sm text-gray-600">by {book.author}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {book.category} • Published {book.publicationYear}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {book.isAvailable ? (
                            <span className="text-green-600 text-xs">Available</span>
                          ) : (
                            <span className="text-red-600 text-xs">Not Available</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredBooks.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No available books found
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm Details */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Confirm Borrowing Details</h3>
                <Button variant="outline" size="sm" onClick={() => setStep('select-book')}>
                  Change Book
                </Button>
              </div>

              {/* Summary */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Member Summary */}
                {internalSelectedMember && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Member
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium">{internalSelectedMember.fullName}</p>
                      <p className="text-sm text-gray-600">{internalSelectedMember.email}</p>
                      <p className="text-xs text-gray-500">{internalSelectedMember.memberType}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Book Summary */}
                {internalSelectedBook && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Book
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="font-medium">{internalSelectedBook.title}</p>
                      <p className="text-sm text-gray-600">by {internalSelectedBook.author}</p>
                      <p className="text-xs text-gray-500">
                        {internalSelectedBook.category} • {internalSelectedBook.publicationYear}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Due Date
                </Label>
                <Input
                  {...register('dueDate', {
                    required: 'Due date is required',
                    validate: (value) => {
                      const selected = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return selected > today || 'Due date must be in the future';
                    }
                  })}
                  type="date"
                  id="dueDate"
                  disabled={isLoading}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-600">{errors.dueDate.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  {...register('notes')}
                  id="notes"
                  placeholder="Any additional notes about this borrowing..."
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              {/* Warnings */}
              {!canProceed() && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    This member cannot borrow more books at this time.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {((step !== 'select-member' && canSelectOtherMembers) || (step !== 'select-book' && !canSelectOtherMembers)) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (step === 'confirm') setStep('select-book');
                    else if (step === 'select-book' && canSelectOtherMembers) setStep('select-member');
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              
              {step === 'confirm' ? (
                <Button
                  type="submit"
                  disabled={isLoading || !canProceed()}
                >
                  {isLoading ? 'Processing...' : 'Confirm Borrowing'}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={
                    isLoading ||
                    (step === 'select-member' && !internalSelectedMember) ||
                    (step === 'select-book' && !internalSelectedBook)
                  }
                  onClick={() => {
                    if (step === 'select-member') setStep('select-book');
                    else if (step === 'select-book') setStep('confirm');
                  }}
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};