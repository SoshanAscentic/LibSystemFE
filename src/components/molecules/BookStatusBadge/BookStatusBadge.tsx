import React from 'react';
import { Badge } from '../../ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface BookStatusBadgeProps {
  isAvailable: boolean;
  variant?: 'default' | 'icon' | 'detailed';
  className?: string;
}

export const BookStatusBadge: React.FC<BookStatusBadgeProps> = ({
  isAvailable,
  variant = 'default',
  className
}) => {
  const showIcon = variant === 'icon' || variant === 'detailed';
  const showText = variant === 'default' || variant === 'detailed';

  if (isAvailable) {
    return (
      <Badge 
        variant="outline"
        className={cn(
          'bg-green-50 text-green-700 border-green-200',
          className
        )}
      >
        {showIcon && <CheckCircle className="mr-1 h-3 w-3" />}
        {showText && 'Available'}
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline"
      className={cn(
        'bg-red-50 text-red-700 border-red-200',
        className
      )}
    >
      {showIcon && <XCircle className="mr-1 h-3 w-3" />}
      {showText && 'Borrowed'}
    </Badge>
  );
};
