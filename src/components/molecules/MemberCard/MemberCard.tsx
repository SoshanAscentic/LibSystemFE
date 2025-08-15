import React from 'react';
import { Member } from '../../../domain/entities/Member';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { User, BookOpen, Calendar } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatDate } from '../../../lib/utils';

interface MemberCardProps {
  member: Member;
  variant?: 'default' | 'compact' | 'detailed';
  onView?: (member: Member) => void;
  className?: string;
}

// Updated to handle Administrator type
const getMemberTypeColor = (memberType: string, role?: string) => {
  // Check role first, then memberType
  const typeToCheck = role || memberType;
  
  switch (typeToCheck.toLowerCase()) {
    case 'regularmember':
    case 'member':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'minorstaff':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'managementstaff':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'administrator':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Updated to handle Administrator type and prioritize role
const getMemberTypeLabel = (memberType: string, role?: string) => {
  // Check role first, then memberType for proper display
  const typeToCheck = role || memberType;
  
  switch (typeToCheck.toLowerCase()) {
    case 'regularmember':
    case 'member':
      return 'Regular Member';
    case 'minorstaff':
      return 'Minor Staff';
    case 'managementstaff':
      return 'Management Staff';
    case 'administrator':
      return 'Administrator';
    default:
      return memberType;
  }
};

// Calculate actual days as member
const calculateDaysAsMember = (registrationDate: Date): number => {
  try {
    const now = new Date();
    const regDate = new Date(registrationDate);
    
    // Validate the date
    if (isNaN(regDate.getTime())) {
      console.warn('Invalid registration date:', registrationDate);
      return 0;
    }
    
    const diffTime = now.getTime() - regDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch (error) {
    console.error('Error calculating membership days:', error);
    return 0;
  }
};

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  variant = 'default',
  onView,
  className
}) => {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  // Debug logging
  console.log('MemberCard: Rendering member:', {
    memberId: member.memberId,
    role: member.role,
    memberType: member.memberType,
    registrationDate: member.registrationDate
  });

  // Safely get member display name
  const displayName = member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || 'Unknown Member';
  
  // Calculate actual days as member
  const daysAsMember = calculateDaysAsMember(member.registrationDate);

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
              {displayName}
            </h3>
            <p className={cn(
              'text-gray-500 truncate mt-1',
              isCompact && 'text-xs',
              'text-sm'
            )}>
              ID: {member.memberId}
            </p>
          </div>
        </div>

        {/* Member Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Use role-aware type display */}
            <Badge 
              variant="outline" 
              className={getMemberTypeColor(member.memberType, member.role)}
            >
              {getMemberTypeLabel(member.memberType, member.role)}
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
        </div>

        {/* Actions */}
        {onView && (
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size={isCompact ? "sm" : "default"}
              onClick={() => onView(member)}
              className="flex-1"
            >
              <User className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};