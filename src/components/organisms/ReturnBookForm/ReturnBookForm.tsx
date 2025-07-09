import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ReturnBookDto } from '../../../domain/dtos/BorrowingDto';
import { BorrowingRecord } from '../../../domain/entities/BorrowingRecord';
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
import { RotateCcw, Search, AlertCircle, CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { formatDate, calculateDaysOverdue } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

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
  isLoadingBorrowings?: boolean;
  onSearchBorrowings?: (query: string) => void;
  selectedBorrowing?: BorrowingRecord | null;
  onSelectBorrowing?: (borrowing: BorrowingRecord) => void;
  className?: string;
}

export const ReturnBookForm: React.FC<ReturnBookFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  activeBorrowings = [],
  isLoadingBorrowings = false,
  onSearchBorrowings,
  selectedBorrowing,
  onSelectBorrowing,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<'select-borrowing' | 'confirm-return'>('select-borrowing');

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

  // Auto-advance to confirmation step when borrowing is selected
  useEffect(() => {
    if (step === 'select-borrowing' && selectedBorrowing && watchedValues.borrowingId) {
      setStep('confirm-return');
    }
  }, [selectedBorrowing, watchedValues.borrowingId, step]);

  // Set form values when selection changes
  useEffect(() => {
    if (selectedBorrowing) {
      setValue('borrowingId', selectedBorrowing.borrowingId.toString());
    }
  }, [selectedBorrowing, setValue]);

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
    setStep('select-borrowing');
    setSearchQuery('');
  };

  const calculateLateFee = (borrowing: BorrowingRecord, returnDate?: string): number => {
    if (!borrowing.isOverdue) return 0;
    
    const actualReturnDate = returnDate ? new Date(returnDate) : new Date();
    const dueDate = new Date(borrowing.dueDate);
    const daysLate = Math.max(0, Math.ceil((actualReturnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Simple late fee calculation: $0.50 per day
    return daysLate * 0.50;
  };

  const filteredBorrowings = activeBorrowings.filter(borrowing => {
    if (searchQuery === '') return true;
    
    const query = searchQuery.toLowerCase();
    return (
      borrowing.bookTitle.toLowerCase().includes(query) ||
      borrowing.bookAuthor.toLowerCase().includes(query) ||
      borrowing.memberName.toLowerCase().includes(query) ||
      borrowing.memberEmail.toLowerCase().includes(query)
    );
  });

  const estimatedLateFee = selectedBorrowing ? calculateLateFee(selectedBorrowing, watchedValues.returnDate) : 0;

  return (
    <Card className={cn("max-w-4xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          Return Book
        </CardTitle>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-4 mt-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            step === 'select-borrowing' ? "bg-blue-100 text-blue-800" : 
            selectedBorrowing ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
          )}>
            <Search className="w-4 h-4" />
            1. Select Borrowing
            {selectedBorrowing && <CheckCircle className="w-4 h-4" />}
          </div>
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full text-sm",
            step === 'confirm-return' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
          )}>
            <RotateCcw className="w-4 h-4" />
            2. Confirm Return
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Step 1: Select Borrowing */}
          {step === 'select-borrowing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Select Book to Return</h3>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              </div>

              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by book title, author, or member name..."
                className="w-full"
              />

              {isLoadingBorrowings ? (
                <LoadingState message="Loading active borrowings..." />
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredBorrowings.map((borrowing) => (
                    <div
                      key={borrowing.borrowingId}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all",
                        selectedBorrowing?.borrowingId === borrowing.borrowingId
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      )}
                      onClick={() => {
                        onSelectBorrowing?.(borrowing);
                        setValue('borrowingId', borrowing.borrowingId.toString());
                      }}
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
                          <p className="text-sm text-gray-600">
                            Borrowed by: {borrowing.memberName} ({borrowing.memberEmail})
                          </p>
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
                        {searchQuery ? 'No borrowings found matching your search' : 'No active borrowings found'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Confirm Return */}
          {step === 'confirm-return' && selectedBorrowing && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Confirm Book Return</h3>
                <Button variant="outline" size="sm" onClick={() => setStep('select-borrowing')}>
                  Change Book
                </Button>
              </div>

              {/* Borrowing Summary */}
              <BorrowingCard
                borrowing={selectedBorrowing}
                showMemberInfo={true}
                showBookInfo={true}
                className="bg-blue-50 border-blue-200"
              />

              {/* Overdue Warning */}
              {selectedBorrowing.isOverdue && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Overdue Notice:</strong> This book is {selectedBorrowing.daysOverdue} days overdue.
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
                      const borrowed = new Date(selectedBorrowing.borrowedAt);
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
                    <p>Days overdue: {selectedBorrowing.daysOverdue}</p>
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
              {step === 'confirm-return' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('select-borrowing')}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              
              {step === 'confirm-return' ? (
                <Button
                  type="submit"
                  disabled={isLoading || !selectedBorrowing}
                >
                  {isLoading ? 'Processing...' : 'Confirm Return'}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isLoading || !selectedBorrowing}
                  onClick={() => setStep('confirm-return')}
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