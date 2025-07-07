import React from 'react';
import { Member } from '../../../domain/entities/Member';
import { Card, CardHeader, CardTitle, CardContent } from '../../molecules/Card';
import { MemberTypeBadge } from '../../molecules/MemberTypeBadge';
import { MemberPermissions } from '../../molecules/MemberPermissions';
import { MemberBorrowingStatus } from '../../molecules/MemberBorrowingStatus';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  User, 
  Mail, 
  Calendar,
  Edit,
  Trash2,
  BookOpen,
  Clock
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';

interface MemberDetailsProps {
  member: Member;
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  className?: string;
}

export const MemberDetails: React.FC<MemberDetailsProps> = ({
  member,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  className
}) => {
  const membershipDurationDays = Math.floor(
    (new Date().getTime() - new Date(member.registrationDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {member.fullName}
                  </h1>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <MemberTypeBadge memberType={member.memberType} variant="detailed" />
                    <Badge 
                      variant={member.isActive ? 'default' : 'destructive'}
                      className={
                        member.isActive 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-red-100 text-red-800 border-red-200'
                      }
                    >
                      {member.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {formatDate(member.registrationDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{membershipDurationDays} days as member</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                {canEdit && onEdit && (
                  <Button
                    variant="outline"
                    onClick={() => onEdit(member)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                )}
                
                {canDelete && onDelete && member.borrowedBooksCount === 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(member)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {member.borrowedBooksCount}
                  </p>
                  <p className="text-sm text-gray-600">Currently Borrowed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Total Borrowed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Overdue Books</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {membershipDurationDays}
                  </p>
                  <p className="text-sm text-gray-600">Days as Member</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Permissions */}
          <MemberPermissions member={member} />
          
          {/* Current Borrowings */}
          <MemberBorrowingStatus member={member} />
        </div>

        {/* Borrowing History */}
        {member.borrowingHistory && member.borrowingHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Borrowing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {member.borrowingHistory.slice(0, 5).map((record, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {record.bookTitle}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          by {record.bookAuthor}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Borrowed: {formatDate(record.borrowedAt)}</span>
                          {record.returnedAt && (
                            <span>Returned: {formatDate(record.returnedAt)}</span>
                          )}
                          <span>{record.daysBorrowed} days</span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0">
                        <Badge 
                          variant={record.isOverdue ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {record.returnedAt ? 'Returned' : record.isOverdue ? 'Overdue' : 'Borrowed'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                
                {member.borrowingHistory.length > 5 && (
                  <div className="text-center pt-3">
                    <Button variant="outline" size="sm">
                      View All History ({member.borrowingHistory.length - 5} more)
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};