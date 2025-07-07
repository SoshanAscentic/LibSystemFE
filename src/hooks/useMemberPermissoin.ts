import { useAuth } from '../contexts/AuthContext';
import { Member, UserRole } from '../domain/entities/Member';

interface MemberPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  canViewBorrowingHistory: boolean;
  canManageUsers: boolean;
}

/**
 * Hook to get current user permissions for member management based on their role
 */
export const useMemberPermissions = (): MemberPermissions & { user: any } => {
  const { user, isAuthenticated } = useAuth();
  
  console.log('🔐 useMemberPermissions: Current user:', user?.email);
  console.log('🔐 useMemberPermissions: User role:', user?.role);
  console.log('🔐 useMemberPermissions: Is authenticated:', isAuthenticated);

  // If not authenticated or no user, return no permissions
  if (!isAuthenticated || !user) {
    console.log('🔐 useMemberPermissions: No auth or user, returning no permissions');
    return {
      canView: false,
      canEdit: false,
      canDelete: false,
      canAdd: false,
      canViewBorrowingHistory: false,
      canManageUsers: false,
      user: null
    };
  }

  const userRole = user.role || 'Member';
  console.log('🔐 useMemberPermissions: Determining permissions for role:', userRole);

  // Define permissions based on role
  const permissions: MemberPermissions = {
    // Member viewing permissions - MinorStaff and above can view members
    canView: ['MinorStaff', 'ManagementStaff', 'Administrator'].includes(userRole),
    
    // Member editing permissions - Only Administrator can edit members
    canEdit: ['Administrator'].includes(userRole),
    canDelete: ['Administrator'].includes(userRole),
    canAdd: ['Administrator'].includes(userRole),
    
    // Borrowing history - Staff and above can view borrowing history
    canViewBorrowingHistory: ['MinorStaff', 'ManagementStaff', 'Administrator'].includes(userRole),
    
    // User management permissions - Only Administrator
    canManageUsers: ['Administrator'].includes(userRole)
  };

  console.log('🔐 useMemberPermissions: Final permissions for', userRole + ':', permissions);

  return {
    ...permissions,
    user
  };
};

/**
 * Hook to check if user can access specific member information
 */
export const useCanAccessMember = () => {
  const { user } = useMemberPermissions();
  
  return {
    canViewMember: (targetMember: Member) => {
      // Administrators can view anyone
      if (user?.role === 'Administrator') {
        return true;
      }
      
      // Staff can view other members
      if (['MinorStaff', 'ManagementStaff'].includes(user?.role || '')) {
        return true;
      }
      
      // Members can only view themselves
      return user?.userId === targetMember.memberId;
    },
    
    canEditMember: (targetMember: Member) => {
      // Only administrators can edit members
      if (user?.role === 'Administrator') {
        return true;
      }
      
      // Members can edit their own profile (basic info only)
      return user?.userId === targetMember.memberId;
    },
    
    canViewBorrowingHistory: (targetMember: Member) => {
      // Staff and administrators can view anyone's history
      if (['MinorStaff', 'ManagementStaff', 'Administrator'].includes(user?.role || '')) {
        return true;
      }
      
      // Members can view their own history
      return user?.userId === targetMember.memberId;
    }
  };
};