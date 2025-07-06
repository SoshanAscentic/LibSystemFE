import { useState, useEffect } from 'react';

interface UserPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canBorrow: boolean;
  canAdd: boolean;
  canViewBorrowing: boolean;
  canManageUsers: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  memberId?: number;
}

// Mock user - replace with actual auth context
const mockUser: User = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Administrator', // Member, MinorStaff, ManagementStaff, Administrator
  memberId: 1
};

/**
 * Hook to get current user permissions based on their role
 */
export const useUserPermissions = (): UserPermissions & { user: User } => {
  const [user] = useState<User>(mockUser);
  
  const permissions: UserPermissions = {
    // Books permissions
    canEdit: ['ManagementStaff', 'Administrator'].includes(user.role),
    canDelete: ['ManagementStaff', 'Administrator'].includes(user.role),
    canAdd: ['ManagementStaff', 'Administrator'].includes(user.role),
    
    // Borrowing permissions
    canBorrow: ['Member', 'MinorStaff', 'ManagementStaff', 'Administrator'].includes(user.role),
    canViewBorrowing: ['MinorStaff', 'ManagementStaff', 'Administrator'].includes(user.role),
    
    // User management permissions
    canManageUsers: ['Administrator'].includes(user.role)
  };

  return {
    ...permissions,
    user
  };
};

/**
 * Hook to check if user can perform specific action on specific resource
 */
export const useCanAccess = () => {
  const { user } = useUserPermissions();
  
  return {
    canViewMember: (targetMemberId: number) => {
      // Staff+ can view any member, regular members can only view themselves
      if (['MinorStaff', 'ManagementStaff', 'Administrator'].includes(user.role)) {
        return true;
      }
      return user.memberId === targetMemberId;
    },
    
    canEditMember: (targetMemberId: number) => {
      // Only Admin can edit any member, members can edit themselves
      if (user.role === 'Administrator') {
        return true;
      }
      return user.memberId === targetMemberId;
    },
    
    canViewBorrowingHistory: (targetMemberId: number) => {
      // Staff+ can view any member's history, members can view their own
      if (['MinorStaff', 'ManagementStaff', 'Administrator'].includes(user.role)) {
        return true;
      }
      return user.memberId === targetMemberId;
    }
  };
};
