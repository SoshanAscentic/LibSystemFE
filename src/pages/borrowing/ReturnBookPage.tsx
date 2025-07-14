import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BorrowingController } from '../../application/controllers/BorrowingController';
import { ReturnBookDto } from '../../domain/dtos/BorrowingDto';
import { BorrowingRecord } from '../../domain/entities/BorrowingRecord';
import { Member } from '../../domain/entities/Member';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { SearchBar } from '../../components/molecules/SearchBar';
import { LoadingState } from '../../components/molecules/LoadingState';
import { Badge } from '../../components/ui/badge';
import { RotateCcw, ArrowLeft, User, Calendar, AlertTriangle, DollarSign } from 'lucide-react';
import { useMembers } from '../../presentation/hooks/Members/useMembers';
import { useMemberBorrowingStatus } from '../../presentation/hooks/Borrowing/useMemberBorrowingStatus';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface ReturnBookPageProps {
  controller: BorrowingController;
}

export const ReturnBookPage: React.FC<ReturnBookPageProps> = ({ controller }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedBorrowing, setSelectedBorrowing] = useState<BorrowingRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');

  // Check if user can select other members (only staff can)
  const canSelectOtherMembers = useMemo(() => 
    user?.role === 'MinorStaff' || user?.role === 'ManagementStaff' || user?.role === 'Administrator', 
    [user?.role]
  );

  // Data hooks - only load members if user can select other members
  const { members, isLoading: membersLoading } = useMembers(canSelectOtherMembers ? undefined : null);
  
  // Create current user as member object for regular members
  const currentUserAsMember = useMemo(() => {
    if (!user) return null;

    if (canSelectOtherMembers) {
      // For staff, find them in the members list
      return members.find(member => member.email === user.email);
    } else {
      // For regular members, create member object from auth user data
      return {
        memberId: user.userId, // Assuming userId corresponds to memberId
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        memberType: 'RegularMember' as any,
        role: 'Member' as any,
        isActive: user.isActive,
        registrationDate: new Date(user.createdAt),
        borrowedBooksCount: 0,
        canBorrowBooks: true,
        canViewBooks: true,
        canViewMembers: false,
        canManageBooks: false,
      } as Member;
    }
  }, [canSelectOtherMembers, members, user]);
  
  // Set default member (for regular members, automatically select themselves)
  useEffect(() => {
    if (currentUserAsMember && !selectedMember) {
      setSelectedMember(currentUserAsMember);
    }
  }, [currentUserAsMember, selectedMember]);

  // Get member's borrowing status and borrowed books
  const { status: memberStatus, isLoading: statusLoading } = useMemberBorrowingStatus(selectedMember?.memberId);

  // Memoized handlers
  const handleBack = useCallback(() => {
    controller.handleNavigateBack();
  }, [controller]);

  const handleSubmit = useCallback(async () => {
    if (!selectedBorrowing) return;

    setIsSubmitting(true);
    
    try {
      const returnData: ReturnBookDto = {
        borrowingId: selectedBorrowing.borrowingId,
        returnDate: returnDate,
        condition: condition,
        notes: notes || undefined
      };

      const result = await controller.handleReturnBook(returnData);
      
      if (result.success) {
        handleBack();
      }
    } catch (error) {
      console.error('Error returning book:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedBorrowing, returnDate, condition, notes, controller, handleBack]);

  const handleMemberSelect = useCallback((member: Member) => {
    setSelectedMember(member);
    setSelectedBorrowing(null); // Reset selected borrowing when member changes
  }, []);

  const handleBorrowingSelect = useCallback((borrowing: BorrowingRecord) => {
    setSelectedBorrowing(borrowing);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleReturnDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setReturnDate(e.target.value);
  }, []);

  const handleConditionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCondition(e.target.value);
  }, []);

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  }, []);

  // Memoized late fee calculation
  const calculateLateFee = useCallback((borrowing: BorrowingRecord): number => {
    if (!borrowing.isOverdue) return 0;
    return borrowing.daysOverdue * 0.50; // $0.50 per day
  }, []);

  // Memoized filtered lists
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

  const activeBorrowings = useMemo(() => 
    memberStatus?.currentBorrowings || [], 
    [memberStatus]
  );

  // Show loading state
  if ((canSelectOtherMembers && membersLoading)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <LoadingState message="Loading members..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 ml-4">Return a Book</h1>
          <p className="text-gray-600 mt-1">
            {/* can add something here to make it look nice */}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={cn(
        "grid gap-6",
        canSelectOtherMembers ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
      )}>
        {/* Member Selection (only for staff) */}
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
              
              <div className="space-y-2 max-h-100 overflow-y-auto">
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

        {/* Borrowed Books Selection */}
        <Card className={canSelectOtherMembers ? "lg:col-span-2" : "col-span-1"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Select Book to Return
              {selectedMember && (
                <span className="text-sm font-normal text-gray-600">
                  {canSelectOtherMembers ? `for ${selectedMember.fullName}` : ''}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedMember ? (
              <div className="text-center py-8 text-gray-500">
                {canSelectOtherMembers ? 'Please select a member first' : 'Loading...'}
              </div>
            ) : statusLoading ? (
              <LoadingState message="Loading borrowed books..." />
            ) : activeBorrowings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No borrowed books found {canSelectOtherMembers ? 'for this member' : 'for you'}
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeBorrowings.map((borrowing) => (
                  <div
                    key={borrowing.borrowingId}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedBorrowing?.borrowingId === borrowing.borrowingId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => handleBorrowingSelect(borrowing)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">{borrowing.bookTitle}</div>
                        <div className="text-sm text-gray-600">by {borrowing.bookAuthor}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Borrowed: {formatDate(borrowing.borrowedAt)}</span>
                          <span>Due: {formatDate(borrowing.dueDate)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {borrowing.isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            {borrowing.daysOverdue} days overdue
                          </Badge>
                        )}
                        {borrowing.isOverdue && (
                          <div className="text-xs text-red-600">
                            Late fee: ${calculateLateFee(borrowing).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Return Form */}
      {selectedBorrowing && (
        <Card>
          <CardHeader>
            <CardTitle>Return Book Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Book Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{selectedBorrowing.bookTitle}</div>
                  <div className="text-sm text-gray-600">by {selectedBorrowing.bookAuthor}</div>
                  <div className="text-sm text-gray-600">
                    Borrowed by: {selectedBorrowing.memberName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    Due: {formatDate(selectedBorrowing.dueDate)}
                  </div>
                  {selectedBorrowing.isOverdue && (
                    <div className="text-red-600 text-sm">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      {selectedBorrowing.daysOverdue} days overdue
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Late Fee Warning */}
            {selectedBorrowing.isOverdue && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">
                    Late Fee: ${calculateLateFee(selectedBorrowing).toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-red-700 mt-1">
                  This book is {selectedBorrowing.daysOverdue} days overdue at $0.50 per day
                </div>
              </div>
            )}

            {/* Return Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="returnDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Return Date
                </Label>
                <Input
                  id="returnDate"
                  type="date"
                  value={returnDate}
                  onChange={handleReturnDateChange}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="condition">Book Condition</Label>
                <select
                  id="condition"
                  value={condition}
                  onChange={handleConditionChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={isSubmitting}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Return Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={handleNotesChange}
                placeholder="Any notes about the book condition or return..."
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Confirm Return'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};