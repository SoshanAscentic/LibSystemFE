import React from 'react';
import { Member } from '../../../domain/entities/Member';
import { Card, CardHeader, CardTitle, CardContent } from '../../molecules/Card';
import { MemberTypeBadge } from '../../molecules/MemberTypeBadge';
import { MemberPermissions } from '../../molecules/MemberPermissions';
import { MemberBorrowingStatus } from '../../molecules/MemberBorrowingStatus';
import { Badge } from '../../ui/badge';
import { 
  User, 
  Mail, 
  Calendar,
  BookOpen,
  Clock
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

interface MemberDetailsProps {
  member: Member;
  canEdit?: boolean;
  canDelete?: boolean;
  className?: string;
}

export const MemberDetails: React.FC<MemberDetailsProps> = ({
  member,
  canEdit = false,
  canDelete = false,
  className
}) => {
  const membershipDurationDays = Math.floor(
    (new Date().getTime() - new Date(member.registrationDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Safely get member display name and email
  const displayName = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown Member';

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header Card */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {displayName}
                </h1>
                
                <div className="flex items-center gap-6 mb-6">
                  <MemberTypeBadge memberType={member.memberType} variant="detailed" />
                  <Badge 
                    variant={member.isActive ? 'default' : 'destructive'}
                    className={cn(
                      "text-sm px-3 py-1",
                      member.isActive 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    )}
                  >
                    {member.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="space-y-3 text-base text-gray-600">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" />
                    <span>Member since {formatDate(member.registrationDate)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5" />
                    <span>{membershipDurationDays} days as member</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {member.borrowedBooksCount || 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Currently Borrowed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {member.borrowingHistory?.length || 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Total Borrowed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {member.currentLoans?.filter(loan => loan.isOverdue).length || 0}
                </p>
                <p className="text-sm font-medium text-gray-600">Overdue Books</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {membershipDurationDays}
                </p>
                <p className="text-sm font-medium text-gray-600">Days as Member</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Permissions */}
        <MemberPermissions member={member} />
        
        {/* Current Borrowings */}
        <MemberBorrowingStatus member={member} />
      </div>

      {/* Borrowing History */}
      {member.borrowingHistory && member.borrowingHistory.length > 0 && (
        <Card>
          <CardHeader className="p-6 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <BookOpen className="w-6 h-6" />
              Borrowing History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="space-y-4">
              {member.borrowingHistory.slice(0, 5).map((record, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900 mb-1">
                        {record.bookTitle}
                      </h4>
                      <p className="text-base text-gray-600 mb-3">
                        by {record.bookAuthor}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>Borrowed: {formatDate(record.borrowedAt)}</span>
                        {record.returnedAt && (
                          <span>Returned: {formatDate(record.returnedAt)}</span>
                        )}
                        <span>{record.daysBorrowed} days</span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <Badge 
                        variant={record.isOverdue ? 'destructive' : 'outline'}
                        className="text-sm px-3 py-1"
                      >
                        {record.returnedAt ? 'Returned' : record.isOverdue ? 'Overdue' : 'Borrowed'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              
              {member.borrowingHistory.length > 5 && (
                <div className="text-center pt-4">
                  <p className="text-base text-gray-500 font-medium">
                    and {member.borrowingHistory.length - 5} more records...
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};