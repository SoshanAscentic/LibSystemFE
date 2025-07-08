import React from 'react';
import { Member } from '../../../domain/entities/Member';
import { LoadingState } from '../../molecules/LoadingState';
import { EmptyState } from '../../molecules/EmptyState';
import { MemberTypeBadge } from '../../molecules/MemberTypeBadge';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '../../ui/table';
import { 
  User, 
  Eye,
  BookOpen,
  Calendar,
  Plus
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';

interface MembersTableProps {
  members: Member[];
  isLoading: boolean;
  onMemberView?: (member: Member) => void;
  onAddMember?: () => void;
  canAdd?: boolean;
  className?: string;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  isLoading,
  onMemberView,
  onAddMember,
  canAdd = false,
  className
}) => {
  if (isLoading) {
    return <LoadingState message="Loading members..." />;
  }

  return (
    <div className={className}>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Library Members</h2>
          <p className="text-gray-600 mt-1">{members.length} member{members.length !== 1 ? 's' : ''} registered</p>
        </div>
        
        {canAdd && onAddMember && (
          <Button onClick={onAddMember} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Register New Member
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        {members.length === 0 ? (
          <EmptyState
            icon={<User className="w-12 h-12" />}
            title="No members found"
            description="No members are currently registered in the system."
            action={canAdd ? {
              label: "Register First Member",
              onClick: onAddMember || (() => {})
            } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Member Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Borrowed Books</TableHead>
                  <TableHead>Join Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member, index) => {
                  const displayName = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown Member';
                  const key = member.memberId && member.memberId > 0 ? member.memberId : `member-${index}-${member.email}`;
                  
                  return (
                    <TableRow key={key}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {displayName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {member.memberId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <MemberTypeBadge memberType={member.memberType} />
                      </TableCell>
                      
                      <TableCell>
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
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {member.borrowedBooksCount || 0}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {formatDate(member.registrationDate)}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {onMemberView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMemberView(member)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};