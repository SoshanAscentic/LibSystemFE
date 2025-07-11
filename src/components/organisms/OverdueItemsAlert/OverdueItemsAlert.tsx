import React from 'react';
import { BorrowingRecord } from '../../../domain/entities/BorrowingRecord';
import { OverdueBadge } from '../../molecules/OverdueBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { AlertTriangle, User, BookOpen, Calendar, DollarSign, Eye, RotateCcw } from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { cn } from '../../../lib/utils';

interface OverdueItemsAlertProps {
  overdueItems: BorrowingRecord[];
  onViewItem?: (item: BorrowingRecord) => void;
  onReturnItem?: (item: BorrowingRecord) => void;
  onViewAllOverdue?: () => void;
  showActions?: boolean;
  maxItemsToShow?: number;
  className?: string;
}

export const OverdueItemsAlert: React.FC<OverdueItemsAlertProps> = ({
  overdueItems,
  onViewItem,
  onReturnItem,
  onViewAllOverdue,
  showActions = true,
  maxItemsToShow = 5,
  className
}) => {
  if (overdueItems.length === 0) {
    return null;
  }

  const totalLateFees = overdueItems.reduce((sum, item) => sum + item.lateFee, 0);
  const itemsToShow = overdueItems.slice(0, maxItemsToShow);
  const hasMoreItems = overdueItems.length > maxItemsToShow;

  const getSeverityLevel = (items: BorrowingRecord[]) => {
    const maxDaysOverdue = Math.max(...items.map(item => item.daysOverdue));
    
    if (maxDaysOverdue >= 30) return 'critical';
    if (maxDaysOverdue >= 14) return 'high';
    if (maxDaysOverdue >= 7) return 'medium';
    return 'low';
  };

  const severity = getSeverityLevel(overdueItems);

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'border-red-600 bg-red-50';
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-yellow-500 bg-yellow-50';
    }
  };

  const getSeverityTitle = (level: string) => {
    switch (level) {
      case 'critical':
        return 'Critical: Books Severely Overdue';
      case 'high':
        return 'High Priority: Books Significantly Overdue';
      case 'medium':
        return 'Medium Priority: Books Overdue';
      default:
        return 'Attention: Books Overdue';
    }
  };

  return (
    <Card className={cn("border-l-4", getSeverityColor(severity), className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <CardTitle className="text-lg text-red-800">
              {getSeverityTitle(severity)}
            </CardTitle>
          </div>
          
          {onViewAllOverdue && (
            <Button variant="outline" size="sm" onClick={onViewAllOverdue}>
              View All Overdue
            </Button>
          )}
        </div>
        
        {/* Summary */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            <strong>{overdueItems.length}</strong> overdue item{overdueItems.length !== 1 ? 's' : ''}
          </span>
          {totalLateFees > 0 && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <strong>${totalLateFees.toFixed(2)}</strong> in late fees
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Overdue Items List */}
        <div className="space-y-3">
          {itemsToShow.map((item) => (
            <div
              key={item.borrowingId}
              className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Book and Member Info */}
                  <div className="flex items-start gap-3 mb-2">
                    <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {item.bookTitle}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        by {item.bookAuthor}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.memberName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {item.memberEmail}
                      </p>
                    </div>
                  </div>

                  {/* Date Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {formatDate(item.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Borrowed: {formatDate(item.borrowedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-end gap-2">
                  <OverdueBadge 
                    daysOverdue={item.daysOverdue} 
                    size="sm"
                  />
                  
                  {item.lateFee > 0 && (
                    <div className="text-xs text-red-600 font-medium">
                      ${item.lateFee.toFixed(2)} fee
                    </div>
                  )}
                  
                  {showActions && (
                    <div className="flex gap-1">
                      {onViewItem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewItem(item)}
                          className="h-6 px-2 text-xs"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                      {onReturnItem && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onReturnItem(item)}
                          className="h-6 px-2 text-xs"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Return
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More */}
        {hasMoreItems && (
          <Alert>
            <AlertDescription className="text-center">
              And {overdueItems.length - maxItemsToShow} more overdue item{overdueItems.length - maxItemsToShow !== 1 ? 's' : ''}.
              {onViewAllOverdue && (
                <Button
                  variant="link"
                  className="ml-2 p-0 h-auto text-sm"
                  onClick={onViewAllOverdue}
                >
                  View all overdue items →
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        {showActions && overdueItems.length > 0 && (
          <div className="flex gap-2 pt-2 border-t">
            {onViewAllOverdue && (
              <Button variant="outline" size="sm" onClick={onViewAllOverdue} className="flex-1">
                View All Overdue Items
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};