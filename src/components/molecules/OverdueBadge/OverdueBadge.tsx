import React from 'react';
import { Badge } from '../../ui/badge';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface OverdueBadgeProps {
  daysOverdue: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const OverdueBadge: React.FC<OverdueBadgeProps> = ({
  daysOverdue,
  className,
  size = 'md',
  showIcon = true
}) => {
  if (daysOverdue <= 0) return null;

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1';
      default:
        return 'text-xs px-2.5 py-0.5';
    }
  };

  const getOverdueSeverity = (days: number) => {
    if (days >= 30) {
      return {
        color: 'bg-red-600 text-white border-red-700',
        label: 'Critical'
      };
    } else if (days >= 14) {
      return {
        color: 'bg-red-500 text-white border-red-600',
        label: 'Severe'
      };
    } else if (days >= 7) {
      return {
        color: 'bg-red-400 text-white border-red-500',
        label: 'High'
      };
    } else {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Overdue'
      };
    }
  };

  const severity = getOverdueSeverity(daysOverdue);

  return (
    <Badge 
      className={cn(
        severity.color,
        getSizeClasses(size),
        'font-medium flex items-center gap-1',
        className
      )}
    >
      {showIcon && <AlertTriangle className="w-3 h-3" />}
      <span>
        {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
      </span>
    </Badge>
  );
};