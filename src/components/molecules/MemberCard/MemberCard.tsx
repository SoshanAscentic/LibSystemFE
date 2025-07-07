import React from 'react';
import { Member } from '../../../domain/entities/Member';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { User, Edit, Trash2, MoreHorizontal, BookOpen, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { cn } from '../../../lib/utils';
import { formatDate } from '../../../lib/utils';

interface MemberCardProps {
  member: Member;
  variant?: 'default' | 'compact' | 'detailed';
  onView?: (member: Member) => void;
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  className?: string;
}

const getMemberTypeColor = (memberType: string) => {
  switch (memberType.toLowerCase()) {
    case 'regularmember':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'minorstaff':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'managementstaff':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getMemberTypeLabel = (memberType: string) => {
  switch (memberType.toLowerCase()) {
    case 'regularmember':
      return 'Regular Member';
    case 'minorstaff':
      return 'Minor Staff';
    case 'managementstaff':
      return 'Management Staff';
    default:
      return memberType;
  }
};

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  variant = 'default',
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
  className
}) => {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-200 hover:shadow-md',
      !member.isActive && 'opacity-75',
      className
    )}>
      <div className={cn(
        'p-4',
        isCompact && 'p-3',
        isDetailed && 'p-6'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-semibold text-gray-900 truncate',
              isCompact && 'text-sm',
              isDetailed && 'text-lg'
            )}>
              {member.fullName}
            </h3>
            <p className={cn(
              'text-gray-600 truncate mt-1',
              isCompact && 'text-xs',
              'text-sm'
            )}>
              {member.email}
            </p>
          </div>

          {/* Actions Menu */}
          {(canEdit || canDelete || onView) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && (
                  <DropdownMenuItem onClick={() => onView(member)}>
                    <User className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                )}
                {canEdit && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(member)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Member
                  </DropdownMenuItem>
                )}
                {canDelete && onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(member)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Member
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Member Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className={getMemberTypeColor(member.memberType)}
            >
              {getMemberTypeLabel(member.memberType)}
            </Badge>
            <Badge 
              variant={member.isActive ? 'default' : 'destructive'}
              className={cn(
                member.isActive 
                  ? 'bg-green-100 text-green-800 border-green-200' 
                  : 'bg-red-100 text-red-800 border-red-200'
              )}
            >
              {member.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Borrowing Stats */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>{member.borrowedBooksCount} borrowed</span>
            </div>
            {isDetailed && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Joined {formatDate(member.registrationDate)}</span>
              </div>
            )}
          </div>

          {!isCompact && (
            <p className="text-xs text-gray-500">
              Member since {formatDate(member.registrationDate)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {onView && (
            <Button 
              variant="outline" 
              size={isCompact ? "sm" : "default"}
              onClick={() => onView(member)}
              className="flex-1"
            >
              <User className="mr-2 h-4 w-4" />
              View
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
