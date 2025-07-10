import { useAuth } from '../contexts/AuthContext'; 

interface UserPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canBorrow: boolean;
  canAdd: boolean;
  canViewBorrowing: boolean;
  canManageUsers: boolean;
  canReturnBooks: boolean;
  canViewAllBorrowings: boolean;
}

/**
 * Hook to get current user permissions based on their role from auth context
 */
export const useUserPermissions = (): UserPermissions & { user: any } => {
  const { user, isAuthenticated } = useAuth();
  
  console.log('useUserPermissions: Current user:', user?.email);
  console.log('useUserPermissions: User role:', user?.role);
  console.log('useUserPermissions: Is authenticated:', isAuthenticated);

  // If not authenticated or no user, return no permissions
  if (!isAuthenticated || !user) {
    console.log('useUserPermissions: No auth or user, returning no permissions');
    return {
      canEdit: false,
      canDelete: false,
      canAdd: false,
      canBorrow: false,
      canViewBorrowing: false,
      canManageUsers: false,
      canReturnBooks: false,
      canViewAllBorrowings: false,
      user: null
    };
  }

  const userRole = user.role || 'Member';
  console.log('useUserPermissions: Determining permissions for role:', userRole);

  // Define permissions based on role
  const permissions: UserPermissions = {
    // Books permissions - Only ManagementStaff and Administrator can manage books
    canEdit: ['ManagementStaff', 'Administrator'].includes(userRole),
    canDelete: ['ManagementStaff', 'Administrator'].includes(userRole),
    canAdd: ['ManagementStaff', 'Administrator'].includes(userRole),
    
    // Borrowing permissions - All roles can borrow and return
    canBorrow: ['Member', 'MinorStaff', 'ManagementStaff', 'Administrator'].includes(userRole),
    canReturnBooks: ['Member', 'MinorStaff', 'ManagementStaff', 'Administrator'].includes(userRole),
    canViewBorrowing: ['MinorStaff', 'ManagementStaff', 'Administrator'].includes(userRole),
    canViewAllBorrowings: ['MinorStaff', 'ManagementStaff', 'Administrator'].includes(userRole),
    
    // User management permissions - Only Administrator
    canManageUsers: ['Administrator'].includes(userRole)
  };

  console.log('useUserPermissions: Final permissions for', userRole + ':', permissions);

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
      if (['MinorStaff', 'ManagementStaff', 'Administrator'].includes(user?.role || '')) {
        return true;
      }
      return user?.userId === targetMemberId;
    },
    
    canEditMember: (targetMemberId: number) => {
      if (user?.role === 'Administrator') {
        return true;
      }
      return user?.userId === targetMemberId;
    },
    
    canViewBorrowingHistory: (targetMemberId: number) => {
      if (['MinorStaff', 'ManagementStaff', 'Administrator'].includes(user?.role || '')) {
        return true;
      }
      return user?.userId === targetMemberId;
    },

    canManageBorrowing: () => {
      return ['ManagementStaff', 'Administrator'].includes(user?.role || '');
    }
  };
};