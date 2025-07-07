import React from 'react';
import { Badge } from '../../ui/badge';
import { User, UserCheck, UserCog } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { MemberType } from '../../../domain/entities/Member';

interface MemberTypeBadgeProps {
  memberType: MemberType;
  variant?: 'default' | 'icon' | 'detailed';
  className?: string;
}

export const MemberTypeBadge: React.FC<MemberTypeBadgeProps> = ({
  memberType,
  variant = 'default',
  className
}) => {
  const showIcon = variant === 'icon' || variant === 'detailed';
  const showText = variant === 'default' || variant === 'detailed';

  const getMemberTypeConfig = (type: MemberType) => {
    switch (type) {
      case MemberType.REGULAR_MEMBER:
        return {
          label: 'Regular Member',
          icon: <User className="mr-1 h-3 w-3" />,
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case MemberType.MINOR_STAFF:
        return {
          label: 'Minor Staff',
          icon: <UserCheck className="mr-1 h-3 w-3" />,
          className: 'bg-amber-50 text-amber-700 border-amber-200'
        };
      case MemberType.MANAGEMENT_STAFF:
        return {
          label: 'Management Staff',
          icon: <UserCog className="mr-1 h-3 w-3" />,
          className: 'bg-purple-50 text-purple-700 border-purple-200'
        };
      default:
        return {
          label: 'Unknown',
          icon: <User className="mr-1 h-3 w-3" />,
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  const config = getMemberTypeConfig(memberType);

  return (
    <Badge 
      variant="outline"
      className={cn(config.className, className)}
    >
      {showIcon && config.icon}
      {showText && config.label}
    </Badge>
  );
};
