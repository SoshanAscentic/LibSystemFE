import React, { useState } from 'react';
import { Member } from '../../../domain/entities/Member';
import { MemberFilters as MemberFiltersType } from '../../../domain/valueObjects/MemberFilters';
import { LoadingState } from '../../molecules/LoadingState';
import { EmptyState } from '../../molecules/EmptyState';
import { MemberFilters } from '../../molecules/MemberFilters';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '../../ui/dropdown-menu';
import { 
  User, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  ArrowUpDown,
  Plus,
  BookOpen,
  Calendar
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';

interface MembersTableProps {
  members: Member[];
  filters: MemberFiltersType;
  onFiltersChange: (filters: Partial<MemberFiltersType>) => void;
  onMemberView?: (member: Member) => void;
  onMemberEdit?: (member: Member) => void;
  onMemberDelete?: (member: Member) => void;
  onAddMember?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canAdd?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  members,
  filters,
  onFiltersChange,
  onMemberView,
  onMemberEdit,
  onMemberDelete,
  onAddMember,
  canEdit = false,
  canDelete = false,
  canAdd = false,
  isLoading = false,
  className
}) => {
  const [sortField, setSortField] = useState<string>('fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  if (isLoading) {
    return <LoadingState message="Loading members..." />;
  }

  return (
    <div className={className}>
      {/* Filters and Actions */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <MemberFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClearFilters={handleClearFilters}
          />
          
          {canAdd && onAddMember && (
            <Button onClick={onAddMember} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card>
        {members.length === 0 ? (
          <EmptyState
            icon={<User />}
            title="No members found"
            description="No members match your current filters."
            action={canAdd ? {
              label: "Add First Member",
              onClick: onAddMember || (() => {})
            } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('fullName')}
                      className="h-auto p-0 font-semibold"
                    >
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('email')}
                      className="h-auto p-0 font-semibold"
                    >
                      Email
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Member Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('borrowedBooksCount')}
                      className="h-auto p-0 font-semibold"
                    >
                      Borrowed Books
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('registrationDate')}
                      className="h-auto p-0 font-semibold"
                    >
                      Join Date
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.memberId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {member.memberId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-gray-900">
                        {member.email}
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
                          {member.borrowedBooksCount}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onMemberView && (
                            <DropdownMenuItem onClick={() => onMemberView(member)}>
                              <User className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                          )}
                          {canEdit && onMemberEdit && (
                            <DropdownMenuItem onClick={() => onMemberEdit(member)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Member
                            </DropdownMenuItem>
                          )}
                          {canDelete && onMemberDelete && member.borrowedBooksCount === 0 && (
                            <DropdownMenuItem 
                              onClick={() => onMemberDelete(member)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Member
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};