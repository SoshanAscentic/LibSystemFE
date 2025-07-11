import { useAuth } from '../contexts/AuthContext'; 

interface BorrowingPermissions {
  canBorrow: boolean;
  canReturn: boolean;
  canViewAll: boolean;
  canManageBorrowing: boolean;
}

/**
 * Hook to get current user permissions for borrowing operations
 */
export const useBorrowingPermissions = (): BorrowingPermissions & { user: any } => {
  const { user, isAuthenticated } = useAuth();
  
  console.log('useBorrowingPermissions: Current user:', user?.email);
  console.log('useBorrowingPermissions: User role:', user?.role);
  console.log('useBorrowingPermissions: Is authenticated:', isAuthenticated);

  // If not authenticated or no user, return no permissions
  if (!isAuthenticated || !user) {
    console.log('useBorrowingPermissions: No auth or user, returning no permissions');
    return {
      canBorrow: false,
      canReturn: false,
      canViewAll: false,
      canManageBorrowing: false,
      user: null
    };
  }

  const userRole = user.role || 'Member';
  console.log('useBorrowingPermissions: Determining permissions for role:', userRole);

  // Define permissions based on role
  const permissions: BorrowingPermissions = {
    // All authenticated users can borrow and return books
    canBorrow: ['Member', 'MinorStaff', 'ManagementStaff', 'Administrator'].includes(userRole),
    canReturn: ['Member', 'MinorStaff', 'ManagementStaff', 'Administrator'].includes(userRole),
    
    // Staff and above can view all borrowing records
    canViewAll: ['MinorStaff', 'ManagementStaff', 'Administrator'].includes(userRole),
    
    // Management staff and above can manage borrowing operations
    canManageBorrowing: ['ManagementStaff', 'Administrator'].includes(userRole)
  };

  console.log('useBorrowingPermissions: Final permissions for', userRole + ':', permissions);

  return {
    ...permissions,
    user
  };
};