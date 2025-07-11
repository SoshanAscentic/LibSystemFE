import React from 'react';
import { useUserPermissions, type PermissionKey } from '../hooks/useUserPermissions';

/**
 * Permission Gate component for conditional rendering
 */
interface PermissionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredPermissions?: PermissionKey[];
  requireAll?: boolean; // If false, requires any permission (default: true)
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  fallback = null,
  requiredPermissions = [],
  requireAll = true
}) => {
  const permissions = useUserPermissions();

  if (permissions.isLoading) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">Loading...</span>
      </div>
    );
  }

  if (permissions.error) {
    return <>{fallback}</>;
  }

  if (requiredPermissions.length > 0) {
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
 * Higher-Order Component for permission-based rendering
 */
export const withPermissions = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermissions: PermissionKey[]
) => {
  const WrappedComponent = React.memo((props: P) => {
    const permissions = useUserPermissions();

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

  WrappedComponent.displayName = `withPermissions(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};