import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ReturnBookDto } from '../../../domain/dtos/BorrowingDto';
import { BorrowingRecord } from '../../../domain/entities/BorrowingRecord';
import { Member } from '../../../domain/entities/Member';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Alert, AlertDescription } from '../../ui/alert';
import { SearchBar } from '../../molecules/SearchBar';
import { BorrowingCard } from '../../molecules/BorrowingCard';
import { LoadingState } from '../../molecules/LoadingState';
import { Badge } from '../../ui/badge';
import { RotateCcw, Search, AlertCircle, CheckCircle, Calendar, DollarSign, User } from 'lucide-react';
import { formatDate, calculateDaysOverdue } from '../../../lib/utils';
import { cn } from '../../../lib/utils';
import { useAuth } from '../../../contexts/AuthContext';

interface ReturnBookFormData {
  borrowingId: string;
  returnDate: string;
  condition: string;
  notes: string;
}

interface ReturnBookFormProps {
  onSubmit: (data: ReturnBookDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  activeBorrowings?: BorrowingRecord[];
  activeMembers?: Member[];
  isLoadingBorrowings?: boolean;
  isLoadingMembers?: boolean;
  onSearchBorrowings?: (query: string) => void;
  selectedBorrowing?: BorrowingRecord | null;
  selectedMember?: Member | null;
  onSelectBorrowing?: (borrowing: BorrowingRecord) => void;
  onSelectMember?: (member: Member) => void;
  onMemberBorrowingsLoad?: (memberId: number) => void;
  className?: string;
}

export const ReturnBookForm: React.FC<ReturnBookFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  activeBorrowings = [],
  activeMembers = [],
  isLoadingBorrowings = false,
  isLoadingMembers = false,
  onSearchBorrowings,
  selectedBorrowing,
  selectedMember,
  onSelectBorrowing,
  onSelectMember,
  onMemberBorrowingsLoad,
  className
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [step, setStep] = useState<'select-member' | 'select-borrowing' | 'confirm-return'>('select-member');
  const [internalSelectedMember, setInternalSelectedMember] = useState<Member | null>(null);
  const [internalSelectedBorrowing, setInternalSelectedBorrowing] = useState<BorrowingRecord | null>(null);

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
  } = useForm<ReturnBookFormData>({
    defaultValues: {
      returnDate: new Date().toISOString().split('T')[0],
      condition: 'Good',
      notes: ''
    }
  });

  const watchedValues = watch();

  // Initialize step based on user permissions
  useEffect(() => {
    if (!canSelectOtherMembers && currentUserAsMember) {
      // Skip member selection for regular members
      setInternalSelectedMember(currentUserAsMember);
      onSelectMember?.(currentUserAsMember);
      onMemberBorrowingsLoad?.(currentUserAsMember.memberId);
      setStep('select-borrowing');
    } else {
      setStep('select-member');
    }
  }, [canSelectOtherMembers, currentUserAsMember, onSelectMember, onMemberBorrowingsLoad]);

  // Auto-advance to confirmation step when borrowing is selected
  useEffect(() => {
    if (step === 'select-borrowing' && internalSelectedBorrowing && watchedValues.borrowingId) {
      setStep('confirm-return');
    }
  }, [internalSelectedBorrowing, watchedValues.borrowingId, step]);

  // Set form values when selection changes
  useEffect(() => {
    if (internalSelectedBorrowing) {
      setValue('borrowingId', internalSelectedBorrowing.borrowingId.toString());
    }
  }, [internalSelectedBorrowing, setValue]);

  const handleFormSubmit = async (data: ReturnBookFormData) => {
    const returnData: ReturnBookDto = {
      borrowingId: parseInt(data.borrowingId),
      returnDate: data.returnDate,
      condition: data.condition || undefined,
      notes: data.notes || undefined
    };

    await onSubmit(returnData);
  };

  const handleReset = () => {
    reset();
    setInternalSelectedMember(null);
    setInternalSelectedBorrowing(null);
    setSearchQuery('');
    setMemberSearchQuery('');
    
    if (!canSelectOtherMembers && currentUserAsMember) {
      setInternalSelectedMember(currentUserAsMember);
      onSelectMember?.(currentUserAsMember);
      onMemberBorrowingsLoad?.(currentUserAsMember.memberId);
      setStep('select-borrowing');
    } else {
      setStep('select-member');
    }
  };

  const handleMemberSelect = (member: Member) => {
    setInternalSelectedMember(member);
    onSelectMember?.(member);
    onMemberBorrowingsLoad?.(member.memberId);
  };

  const handleBorrowingSelect = (borrowing: BorrowingRecord) => {
    setInternalSelectedBorrowing(borrowing);
    onSelectBorrowing?.(borrowing);
    setValue('borrowingId', borrowing.borrowingId.toString());
  };

  const calculateLateFee = (borrowing: BorrowingRecord, returnDate?: string): number => {
    if (!borrowing.isOverdue) return 0;
    
    const actualReturnDate = returnDate ? new Date(returnDate) : new Date();
    const dueDate = new Date(borrowing.dueDate);
    const daysLate = Math.max(0, Math.ceil((actualReturnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Simple late fee calculation: $0.50 per day
    return daysLate * 0.50;
  };

  // Filter borrowings by selected member
  const memberBorrowings = activeBorrowings.filter(borrowing => 
    !internalSelectedMember || borrowing.memberId === internalSelectedMember.memberId
  );

  const filteredBorrowings = memberBorrowings.filter(borrowing => {
    if (searchQuery === '') return true;
    
    const query = searchQuery.toLowerCase();
    return (
      borrowing.bookTitle.toLowerCase().includes(query) ||
      borrowing.bookAuthor.toLowerCase().includes(query)
    );
  });

  const filteredMembers = activeMembers.filter(member =>
    memberSearchQuery === '' ||
    member.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  const estimatedLateFee = internalSelectedBorrowing ? calculateLateFee(internalSelectedBorrowing, watchedValues.returnDate) : 0;

  return (
    <Card className={cn("max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          Return Book
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
            step === 'select-borrowing' ? "bg-blue-100 text-blue-800" : 
            internalSelectedBorrowing ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
          )}>
            <Search className="w-4 h-4" />
            {canSelectOtherMembers ? '2.' : '1.'} Select Borrowing
            {internalSelectedBorrowing && <CheckCircle className="w-4 h-4" />}
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            step === 'confirm-return' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
          )}>
            <RotateCcw className="w-4 h-4" />
            {canSelectOtherMembers ? '3.' : '2.'} Confirm Return
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

          {/* Step 2: Select Borrowing */}
          {step === 'select-borrowing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Select Book to Return</h3>
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
                    {canSelectOtherMembers ? 'Selected Member' : 'Returning for'}: <strong>{internalSelectedMember.fullName}</strong> ({internalSelectedMember.email})
                  </AlertDescription>
                </Alert>
              )}

              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by book title or author..."
                className="w-full"
              />

              {isLoadingBorrowings ? (
                <LoadingState message="Loading borrowed books..." />
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredBorrowings.map((borrowing) => (
                    <div
                      key={borrowing.borrowingId}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all",
                        internalSelectedBorrowing?.borrowingId === borrowing.borrowingId
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      )}
                      onClick={() => handleBorrowingSelect(borrowing)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{borrowing.bookTitle}</h4>
                            {borrowing.isOverdue && (
                              <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">
                                {borrowing.daysOverdue} days overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">by {borrowing.bookAuthor}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Borrowed: {formatDate(borrowing.borrowedAt)}</span>
                            <span>Due: {formatDate(borrowing.dueDate)}</span>
                            <span>Duration: {borrowing.daysBorrowed} days</span>
                          </div>
                        </div>
                        <div className="text-right">
                          {borrowing.isOverdue && (
                            <div className="text-red-600 text-sm font-medium">
                              Est. Late Fee: ${calculateLateFee(borrowing).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredBorrowings.length === 0 && (
                    <div className="text-center py-12">
                      <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {internalSelectedMember 
                          ? `No borrowed books found for ${internalSelectedMember.fullName}`
                          : searchQuery 
                            ? 'No borrowings found matching your search' 
                            : 'No active borrowings found'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm Return */}
          {step === 'confirm-return' && internalSelectedBorrowing && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Confirm Book Return</h3>
                <Button variant="outline" size="sm" onClick={() => setStep('select-borrowing')}>
                  Change Book
                </Button>
              </div>

              {/* Borrowing Summary */}
              <BorrowingCard
                borrowing={internalSelectedBorrowing}
                showMemberInfo={canSelectOtherMembers}
                showBookInfo={true}
                className="bg-blue-50 border-blue-200"
              />

              {/* Overdue Warning */}
              {internalSelectedBorrowing.isOverdue && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Overdue Notice:</strong> This book is {internalSelectedBorrowing.daysOverdue} days overdue.
                    {estimatedLateFee > 0 && (
                      <>
                        {' '}An estimated late fee of <strong>${estimatedLateFee.toFixed(2)}</strong> will be applied.
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Return Date */}
              <div className="space-y-2">
                <Label htmlFor="returnDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Return Date
                </Label>
                <Input
                  {...register('returnDate', {
                    required: 'Return date is required',
                    validate: (value) => {
                      const selected = new Date(value);
                      const borrowed = new Date(internalSelectedBorrowing.borrowedAt);
                      const today = new Date();
                      
                      if (selected < borrowed) {
                        return 'Return date cannot be before borrowed date';
                      }
                      if (selected > today) {
                        return 'Return date cannot be in the future';
                      }
                      return true;
                    }
                  })}
                  type="date"
                  id="returnDate"
                  disabled={isLoading}
                />
                {errors.returnDate && (
                  <p className="text-sm text-red-600">{errors.returnDate.message}</p>
                )}
              </div>

              {/* Book Condition */}
              <div className="space-y-2">
                <Label htmlFor="condition">Book Condition</Label>
                <select
                  {...register('condition')}
                  id="condition"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>

              {/* Return Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Return Notes (Optional)</Label>
                <Textarea
                  {...register('notes')}
                  id="notes"
                  placeholder="Any notes about the book condition or return process..."
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              {/* Late Fee Summary */}
              {estimatedLateFee > 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-red-600" />
                    <h4 className="font-medium text-red-800">Late Fee Calculation</h4>
                  </div>
                  <div className="text-sm text-red-700">
                    <p>Days overdue: {internalSelectedBorrowing.daysOverdue}</p>
                    <p>Rate: $0.50 per day</p>
                    <p className="font-medium text-base mt-2">
                      Total estimated fee: ${estimatedLateFee.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            
            <div className="flex gap-2">
              {((step !== 'select-member' && canSelectOtherMembers) || (step !== 'select-borrowing' && !canSelectOtherMembers)) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (step === 'confirm-return') setStep('select-borrowing');
                    else if (step === 'select-borrowing' && canSelectOtherMembers) setStep('select-member');
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              
              {step === 'confirm-return' ? (
                <Button
                  type="submit"
                  disabled={isLoading || !internalSelectedBorrowing}
                >
                  {isLoading ? 'Processing...' : 'Confirm Return'}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={
                    isLoading ||
                    (step === 'select-member' && !internalSelectedMember) ||
                    (step === 'select-borrowing' && !internalSelectedBorrowing)
                  }
                  onClick={() => {
                    if (step === 'select-member') setStep('select-borrowing');
                    else if (step === 'select-borrowing') setStep('confirm-return');
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