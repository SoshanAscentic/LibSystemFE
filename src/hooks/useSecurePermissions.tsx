import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Types and Interfaces
interface UserPermissions {
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

interface ServerPermissionResponse {
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  canBorrow: boolean;
  canViewBorrowing: boolean;
  canManageUsers: boolean;
  canReturnBooks: boolean;
  canViewAllBorrowings: boolean;
  userRole: string;
  userId: number;
  memberId?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    type: string;
  };
}

interface ResourceAccessResponse {
  hasAccess: boolean;
}

type PermissionKey = keyof Omit<UserPermissions, 'isLoading' | 'error'>;

// Default permission state
const DEFAULT_PERMISSIONS: UserPermissions = {
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

/**
 * SECURE Hook that verifies permissions with the server
 * Never trust client-side role claims alone
 */
export const useSecurePermissions = (): UserPermissions & { user: any } => {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS);

  const verifyPermissions = useCallback(async () => {
    // Reset to loading state
    setPermissions(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    // If not authenticated, clear all permissions
    if (!isAuthenticated || !user) {
      setPermissions({
        ...DEFAULT_PERMISSIONS,
        isLoading: false,
        error: null
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/permissions', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data: ApiResponse<ServerPermissionResponse> = await response.json();
        
        if (data.success && data.data) {
          const serverPermissions = data.data;
          
          // Safely map server response to local state
          setPermissions({
            canEdit: Boolean(serverPermissions.canEdit),
            canDelete: Boolean(serverPermissions.canDelete),
            canAdd: Boolean(serverPermissions.canAdd),
            canBorrow: Boolean(serverPermissions.canBorrow),
            canViewBorrowing: Boolean(serverPermissions.canViewBorrowing),
            canManageUsers: Boolean(serverPermissions.canManageUsers),
            canReturnBooks: Boolean(serverPermissions.canReturnBooks),
            canViewAllBorrowings: Boolean(serverPermissions.canViewAllBorrowings),
            isLoading: false,
            error: null
          });
        } else {
          throw new Error(data.error?.message || 'Invalid response from server');
        }
      } else if (response.status === 401) {
        // Unauthorized - clear all permissions
        setPermissions({
          ...DEFAULT_PERMISSIONS,
          isLoading: false,
          error: 'Authentication required'
        });
      } else if (response.status === 403) {
        // Forbidden - user has no permissions
        setPermissions({
          ...DEFAULT_PERMISSIONS,
          isLoading: false,
          error: 'Access denied'
        });
      } else {
        throw new Error(`Permission verification failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Permission verification error:', error);
      
      // On error, deny all permissions for security
      setPermissions({
        ...DEFAULT_PERMISSIONS,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Permission verification failed'
      });
    }
  }, [isAuthenticated, user?.email, user?.userId]); // Stable dependencies

  // Only verify permissions when auth is initialized
  useEffect(() => {
    if (isInitialized) {
      verifyPermissions();
    }
  }, [isInitialized, verifyPermissions]);

  return {
    ...permissions,
    user
  };
};

/**
 * SECURE Hook for specific resource access verification
 */
export const useSecureResourceAccess = () => {
  const { isAuthenticated } = useAuth();

  const verifyResourceAccess = useCallback(async (
    resource: string, 
    action: string, 
    resourceId?: number
  ): Promise<boolean> => {
    // If not authenticated, deny access
    if (!isAuthenticated) {
      return false;
    }

    try {
      const params = new URLSearchParams({
        resource: resource.toLowerCase(),
        action: action.toLowerCase(),
      });

      if (resourceId !== undefined) {
        params.append('resourceId', resourceId.toString());
      }

      const response = await fetch(`/api/auth/verify-access?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data: ApiResponse<ResourceAccessResponse> = await response.json();
        return Boolean(data.success && data.data?.hasAccess);
      }

      // Any non-200 response means no access
      return false;
    } catch (error) {
      console.error('Resource access verification failed:', error);
      // On error, deny access for security
      return false;
    }
  }, [isAuthenticated]);

  return {
    verifyResourceAccess,
    
    // Specific resource checks (all return Promises)
    canViewMember: async (targetMemberId: number): Promise<boolean> => {
      return await verifyResourceAccess('members', 'read', targetMemberId);
    },
    
    canEditMember: async (targetMemberId: number): Promise<boolean> => {
      return await verifyResourceAccess('members', 'update', targetMemberId);
    },
    
    canViewBorrowingHistory: async (targetMemberId: number): Promise<boolean> => {
      return await verifyResourceAccess('borrowing', 'read', targetMemberId);
    },

    canManageBorrowing: async (): Promise<boolean> => {
      return await verifyResourceAccess('borrowing', 'manage');
    },

    canDeleteBook: async (bookId: number): Promise<boolean> => {
      return await verifyResourceAccess('books', 'delete', bookId);
    },

    canEditBook: async (bookId: number): Promise<boolean> => {
      return await verifyResourceAccess('books', 'update', bookId);
    },

    canCreateBook: async (): Promise<boolean> => {
      return await verifyResourceAccess('books', 'create');
    },

    canViewMemberList: async (): Promise<boolean> => {
      return await verifyResourceAccess('members', 'list');
    },

    canCreateMember: async (): Promise<boolean> => {
      return await verifyResourceAccess('members', 'create');
    }
  };
};

/**
 * Hook for checking a single permission with loading state
 */
export const usePermissionCheck = (
  resource: string, 
  action: string, 
  resourceId?: number
) => {
  const [state, setState] = useState({
    isLoading: true,
    hasPermission: false,
    error: null as string | null
  });
  
  const { verifyResourceAccess } = useSecureResourceAccess();

  useEffect(() => {
    if (!resource || !action) {
      setState({
        isLoading: false,
        hasPermission: false,
        error: 'Resource and action are required'
      });
      return;
    }

    const checkPermission = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const result = await verifyResourceAccess(resource, action, resourceId);
        
        setState({
          isLoading: false,
          hasPermission: result,
          error: null
        });
      } catch (err) {
        setState({
          isLoading: false,
          hasPermission: false,
          error: err instanceof Error ? err.message : 'Permission check failed'
        });
      }
    };

    checkPermission();
  }, [resource, action, resourceId, verifyResourceAccess]);

  return state;
};

/**
 * Higher-Order Component for secure permission-based rendering
 */
export const withSecurePermissions = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: PermissionKey[]
) => {
  const WrappedComponent = React.memo((props: P) => {
    const permissions = useSecurePermissions();

    if (permissions.isLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Verifying permissions...</span>
        </div>
      );
    }

    if (permissions.error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700">Permission verification failed: {permissions.error}</p>
          </div>
        </div>
      );
    }

    const hasRequiredPermissions = requiredPermissions.every(
      permission => permissions[permission] === true
    );

    if (!hasRequiredPermissions) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-yellow-700">You don't have permission to access this content.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  });

  WrappedComponent.displayName = `withSecurePermissions(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Component for conditional rendering based on permissions
 */
interface PermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  resource?: string;
  action?: string;
  resourceId?: number;
  requiredPermissions?: PermissionKey[];
  requireAll?: boolean; // If false, requires any permission (default: true)
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  fallback = null,
  resource,
  action,
  resourceId,
  requiredPermissions,
  requireAll = true
}) => {
  const permissions = useSecurePermissions();
  const specificPermissionCheck = usePermissionCheck(
    resource || '', 
    action || '', 
    resourceId
  );

  // Check specific resource/action permission
  if (resource && action) {
    if (specificPermissionCheck.isLoading) {
      return (
        <div className="flex items-center justify-center p-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Checking permissions...</span>
        </div>
      );
    }
    
    if (specificPermissionCheck.error) {
      return <>{fallback}</>;
    }
    
    if (!specificPermissionCheck.hasPermission) {
      return <>{fallback}</>;
    }

    return <>{children}</>;
  }
  
  // Check general permissions
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (permissions.isLoading) {
      return (
        <div className="flex items-center justify-center p-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Verifying permissions...</span>
        </div>
      );
    }

    if (permissions.error) {
      return <>{fallback}</>;
    }

    const checkPermissions = requireAll
      ? requiredPermissions.every(permission => permissions[permission] === true)
      : requiredPermissions.some(permission => permissions[permission] === true);

    if (!checkPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

/**
 * Hook to refresh permissions manually
 */
export const useRefreshPermissions = () => {
  const permissions = useSecurePermissions();
  
  const refreshPermissions = useCallback(async () => {
    // Force a re-check by calling the auth endpoint
    try {
      await fetch('/api/auth/permissions', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store' // Force fresh request
      });
      
      // The useSecurePermissions hook will automatically update
      // when the component re-renders
      window.location.reload(); // Simple way to refresh permissions
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
    }
  }, []);

  return {
    refreshPermissions,
    isLoading: permissions.isLoading,
    error: permissions.error
  };
};

// Export types for external use
export type { UserPermissions, PermissionKey };
