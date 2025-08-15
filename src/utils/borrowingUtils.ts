import { BorrowingRecord, BorrowingStatus } from '../domain/entities/BorrowingRecord';
import { formatDate, calculateDaysOverdue } from '../lib/utils';

export function getBorrowingStatusColor(status: BorrowingStatus, isOverdue: boolean): string {
  switch (status) {
    case BorrowingStatus.ACTIVE:
      return isOverdue 
        ? 'bg-red-100 text-red-800 border-red-200'
        : 'bg-blue-100 text-blue-800 border-blue-200';
    case BorrowingStatus.RETURNED:
      return 'bg-green-100 text-green-800 border-green-200';
    case BorrowingStatus.OVERDUE:
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getBorrowingStatusText(borrowing: BorrowingRecord): string {
  if (borrowing.isReturned) {
    return 'Returned';
  }
  
  if (borrowing.isOverdue) {
    return `Overdue (${borrowing.daysOverdue} days)`;
  }
  
  return 'Active';
}

export function calculateLateFee(borrowing: BorrowingRecord, dailyRate: number = 0.50): number {
  if (!borrowing.isOverdue || borrowing.isReturned) {
    return borrowing.lateFee || 0;
  }
  
  return borrowing.daysOverdue * dailyRate;
}

export function formatBorrowingDuration(borrowing: BorrowingRecord): string {
  const days = borrowing.daysBorrowed;
  if (days === 1) return '1 day';
  return `${days} days`;
}

export function getBorrowingSeverity(borrowing: BorrowingRecord): 'low' | 'medium' | 'high' | 'critical' {
  if (!borrowing.isOverdue) return 'low';
  
  const daysOverdue = borrowing.daysOverdue;
  if (daysOverdue >= 30) return 'critical';
  if (daysOverdue >= 14) return 'high';
  if (daysOverdue >= 7) return 'medium';
  return 'low';
}

export function groupBorrowingsByStatus(borrowings: BorrowingRecord[]): {
  active: BorrowingRecord[];
  overdue: BorrowingRecord[];
  returned: BorrowingRecord[];
} {
  return borrowings.reduce((groups, borrowing) => {
    if (borrowing.isReturned) {
      groups.returned.push(borrowing);
    } else if (borrowing.isOverdue) {
      groups.overdue.push(borrowing);
    } else {
      groups.active.push(borrowing);
    }
    return groups;
  }, {
    active: [] as BorrowingRecord[],
    overdue: [] as BorrowingRecord[],
    returned: [] as BorrowingRecord[]
  });
}

export function exportBorrowingsToCSV(borrowings: BorrowingRecord[], filename?: string): void {
  const csvData = borrowings.map(borrowing => ({
    'Borrowing ID': borrowing.borrowingId,
    'Book Title': borrowing.bookTitle,
    'Book Author': borrowing.bookAuthor,
    'Member Name': borrowing.memberName,
    'Member Email': borrowing.memberEmail,
    'Borrowed Date': formatDate(borrowing.borrowedAt),
    'Due Date': formatDate(borrowing.dueDate),
    'Returned Date': borrowing.returnedAt ? formatDate(borrowing.returnedAt) : '',
    'Status': borrowing.status,
    'Days Borrowed': borrowing.daysBorrowed,
    'Days Overdue': borrowing.daysOverdue,
    'Late Fee': borrowing.lateFee.toFixed(2),
    'Is Overdue': borrowing.isOverdue ? 'Yes' : 'No'
  }));

  const csvString = [
    Object.keys(csvData[0] || {}).join(','),
    ...csvData.map(row => Object.values(row).map(value => 
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(','))
  ].join('\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `borrowing-records-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}