import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface UserPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canBorrow: boolean;
  canAdd: boolean;
  canViewBorrowing: boolean;
  canManageUsers: boolean;
  canReturnBooks: boolean;
  canViewAllBorrowings: boolean;
  isLoading: boolean;
  error: string | null;
}

export type PermissionKey = keyof Omit<UserPermissions, 'isLoading' | 'error'>;

/**
 * FIXED: Client-side permissions with proper role validation
 */
export const useUserPermissions = (): UserPermissions & { user: any } => {
  const { user, isLoading: authLoading, isInitialized, isAuthenticated } = useAuth();

  const permissions = useMemo((): UserPermissions => {
    console.log('🔍 useUserPermissions: Calculating permissions...', {
      authLoading,
      isInitialized,
      isAuthenticated,
      userEmail: user?.email,
      userRole: user?.role
    });

    // IMPORTANT: Wait for auth to be fully initialized before calculating permissions
    if (!isInitialized || authLoading) {
      console.log('⏳ useUserPermissions: Auth not ready, showing loading state');
      return {
        canEdit: false,
        canDelete: false,
        canAdd: false,
        canBorrow: false,
        canViewBorrowing: false,
        canManageUsers: false,
        canReturnBooks: false,
        canViewAllBorrowings: false,
        isLoading: true,
        error: null
      };
    }

    // If not authenticated, return no permissions
    if (!isAuthenticated || !user) {
      console.log('❌ useUserPermissions: Not authenticated, no permissions');
      return {
        canEdit: false,
        canDelete: false,
        canAdd: false,
        canBorrow: false,
        canViewBorrowing: false,
        canManageUsers: false,
        canReturnBooks: false,
        canViewAllBorrowings: false,
        isLoading: false,
        error: null
      };
    }

    // CRITICAL: Validate user has a role
    if (!user.role || user.role.trim() === '') {
      console.error('❌ useUserPermissions: User has no valid role!', user);
      return {
        canEdit: false,
        canDelete: false,
        canAdd: false,
        canBorrow: false,
        canViewBorrowing: false,
        canManageUsers: false,
        canReturnBooks: false,
        canViewAllBorrowings: false,
        isLoading: false,
        error: 'User has no valid role'
      };
    }

    const userRole = user.role.trim();
    console.log('✅ useUserPermissions: Calculating permissions for role:', userRole);

    // Define permissions based on role with proper validation
    let rolePermissions: Omit<UserPermissions, 'isLoading' | 'error'>;

    switch (userRole) {
      case 'Administrator':
        console.log('🔑 Administrator permissions granted');
        rolePermissions = {
          canEdit: true,
          canDelete: true,
          canAdd: true,
          canBorrow: true,
          canViewBorrowing: true,
          canManageUsers: true,
          canReturnBooks: true,
          canViewAllBorrowings: true
        };
        break;

      case 'ManagementStaff':
        console.log('👔 ManagementStaff permissions granted');
        rolePermissions = {
          canEdit: true,
          canDelete: true,
          canAdd: true,
          canBorrow: true,
          canViewBorrowing: true,
          canManageUsers: false,
          canReturnBooks: true,
          canViewAllBorrowings: true
        };
        break;

      case 'MinorStaff':
        console.log('👤 MinorStaff permissions granted');
        rolePermissions = {
          canEdit: false,
          canDelete: false,
          canAdd: false,
          canBorrow: true,
          canViewBorrowing: true,
          canManageUsers: false,
          canReturnBooks: true,
          canViewAllBorrowings: true
        };
        break;

      case 'Member':
        console.log('📚 Member permissions granted');
        rolePermissions = {
          canEdit: false,
          canDelete: false,
          canAdd: false,
          canBorrow: true,
          canViewBorrowing: false,
          canManageUsers: false,
          canReturnBooks: true,
          canViewAllBorrowings: false
        };
        break;

      default:
        console.warn('⚠️ useUserPermissions: Unknown role, defaulting to minimal permissions:', userRole);
        rolePermissions = {
          canEdit: false,
          canDelete: false,
          canAdd: false,
          canBorrow: false,
          canViewBorrowing: false,
          canManageUsers: false,
          canReturnBooks: false,
          canViewAllBorrowings: false
        };
        break;
    }

    console.log('useUserPermissions: Final permissions for', userRole + ':', rolePermissions);

    return {
      ...rolePermissions,
      isLoading: false,
      error: null
    };
  }, [user, authLoading, isInitialized, isAuthenticated]); // Added more dependencies for stability

  return {
    ...permissions,
    user
  };
};

/**
 * Helper hook for specific permission checks with role validation
 */
export const useCanAccess = () => {
  const { user } = useUserPermissions();
  
  return {
    canViewMember: (targetMemberId: number): boolean => {
      if (!user?.role) {
        console.log('canViewMember: No user role, denying access');
        return false;
      }
      
      if (['MinorStaff', 'ManagementStaff', 'Administrator'].includes(user.role)) {
        return true;
      }
      return user?.userId === targetMemberId;
    },
    
    canEditMember: (targetMemberId: number): boolean => {
      if (!user?.role) {
        console.log('canEditMember: No user role, denying access');
        return false;
      }
      
      if (user.role === 'Administrator') {
        return true;
      }
      return user?.userId === targetMemberId;
    },
    
    canViewBorrowingHistory: (targetMemberId: number): boolean => {
      if (!user?.role) {
        console.log('canViewBorrowingHistory: No user role, denying access');
        return false;
      }
      
      if (['MinorStaff', 'ManagementStaff', 'Administrator'].includes(user.role)) {
        return true;
      }
      return user?.userId === targetMemberId;
    },

    canManageBorrowing: (): boolean => {
      if (!user?.role) {
        console.log('canManageBorrowing: No user role, denying access');
        return false;
      }
      
      return ['ManagementStaff', 'Administrator'].includes(user.role);
    }
  };
};

/**
 * Hook for role-based access control with validation
 */
export const useRoleCheck = () => {
  const { user } = useUserPermissions();
  
  return {
    hasRole: (role: string): boolean => {
      if (!user?.role) {
        console.log('hasRole: No user role available');
        return false;
      }
      return user.role === role;
    },
    
    hasAnyRole: (roles: string[]): boolean => {
      if (!user?.role) {
        console.log('hasAnyRole: No user role available');
        return false;
      }
      return roles.includes(user.role);
    },
    
    isAtLeastRole: (minimumRole: string): boolean => {
      if (!user?.role) {
        console.log('isAtLeastRole: No user role available');
        return false;
      }
      
      const roleHierarchy = ['Member', 'MinorStaff', 'ManagementStaff', 'Administrator'];
      const userRoleIndex = roleHierarchy.indexOf(user.role);
      const minimumRoleIndex = roleHierarchy.indexOf(minimumRole);
      
      if (userRoleIndex === -1 || minimumRoleIndex === -1) {
        console.warn('isAtLeastRole: Unknown role in hierarchy check');
        return false;
      }
      
      return userRoleIndex >= minimumRoleIndex;
    },
    
    getCurrentRole: (): string | null => {
      return user?.role || null;
    }
  };
};