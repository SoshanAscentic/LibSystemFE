// src/hooks/useDashboardStats.ts
import { useState, useEffect } from 'react';
import { useBooks } from '../presentation/hooks/Books/useBooks';
import { useMembers } from '../presentation/hooks/Members/useMembers';
import { useUserPermissions } from './useUserPermissions';

interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  totalMembers: number;
  borrowedBooks: number;
  isLoading: boolean;
  error: string | null;
  hasPermissionForMembers: boolean;
}

export const useDashboardStats = (): DashboardStats => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    availableBooks: 0,
    totalMembers: 0,
    borrowedBooks: 0,
    isLoading: true,
    error: null,
    hasPermissionForMembers: false
  });

  const permissions = useUserPermissions();
  
  // Fetch all books (no filters to get complete data)
  const { books, isLoading: booksLoading, error: booksError } = useBooks();
  
  // Only fetch members if user has permission to view borrowing/members
  const canViewMembers = permissions.canViewBorrowing && !permissions.isLoading;
  const { members, isLoading: membersLoading, error: membersError } = useMembers(
    canViewMembers ? undefined : null
  );

  useEffect(() => {
    // Wait for permissions to be determined
    if (permissions.isLoading) {
      setStats(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // Wait for books to load (always required)
    if (booksLoading) {
      setStats(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // If user can view members, wait for members to load too
    if (canViewMembers && membersLoading) {
      setStats(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // Check for errors
    if (booksError || (canViewMembers && membersError)) {
      setStats(prev => ({
        ...prev,
        isLoading: false,
        error: booksError || membersError || 'Failed to load dashboard data'
      }));
      return;
    }

    // Calculate stats from loaded data
    const totalBooks = books.length;
    const availableBooks = books.filter(book => book.isAvailable).length;
    const borrowedBooks = books.filter(book => !book.isAvailable).length;
    const totalMembers = canViewMembers ? members.length : 0;

    setStats({
      totalBooks,
      availableBooks,
      totalMembers,
      borrowedBooks,
      isLoading: false,
      error: null,
      hasPermissionForMembers: canViewMembers
    });

    console.log('Dashboard stats calculated:', {
      totalBooks,
      availableBooks,
      borrowedBooks,
      totalMembers: canViewMembers ? totalMembers : 'No permission',
      userRole: permissions.user?.role
    });

  }, [
    books, 
    members, 
    booksLoading, 
    membersLoading, 
    booksError, 
    membersError, 
    canViewMembers,
    permissions.isLoading
  ]);

  return stats;
};