import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingState } from './molecules/LoadingState';

interface SecureProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  resource?: string;
  action?: string;
  resourceId?: number;
  fallback?: React.ReactNode;
}

interface PermissionState {
  isLoading: boolean;
  hasAccess: boolean;
  error: string | null;
}

export const SecureProtectedRoute: React.FC<SecureProtectedRouteProps> = ({
  children,
  roles,
  resource,
  action,
  resourceId,
  fallback
}) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();
  const [permissionState, setPermissionState] = useState<PermissionState>({
    isLoading: true,
    hasAccess: false,
    error: null
  });

  useEffect(() => {
    const verifyAccess = async () => {
      if (!isAuthenticated) {
        setPermissionState({
          isLoading: false,
          hasAccess: false,
          error: 'Not authenticated'
        });
        return;
      }

      try {
        setPermissionState(prev => ({ ...prev, isLoading: true, error: null }));

        // If specific resource/action specified, verify with server
        if (resource && action) {
          const params = new URLSearchParams({
            resource,
            action,
            ...(resourceId && { resourceId: resourceId.toString() })
          });

          const response = await fetch(`/api/auth/verify-access?${params}`, {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            setPermissionState({
              isLoading: false,
              hasAccess: data.success && data.data.hasAccess,
              error: null
            });
          } else {
            setPermissionState({
              isLoading: false,
              hasAccess: false,
              error: 'Access verification failed'
            });
          }
        }
        // If roles specified, verify with server
        else if (roles && roles.length > 0) {
          const response = await fetch('/api/auth/permissions', {
            method: 'GET',
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              const userRole = data.data.userRole;
              const hasRequiredRole = roles.includes(userRole);
              
              setPermissionState({
                isLoading: false,
                hasAccess: hasRequiredRole,
                error: null
              });
            } else {
              setPermissionState({
                isLoading: false,
                hasAccess: false,
                error: 'Permission verification failed'
              });
            }
          } else {
            setPermissionState({
              isLoading: false,
              hasAccess: false,
              error: 'Permission verification failed'
            });
          }
        }
        // No specific requirements, just check authentication
        else {
          setPermissionState({
            isLoading: false,
            hasAccess: true,
            error: null
          });
        }
      } catch (error) {
        console.error('Access verification error:', error);
        setPermissionState({
          isLoading: false,
          hasAccess: false,
          error: 'Access verification failed'
        });
      }
    };

    if (isInitialized) {
      verifyAccess();
    }
  }, [isAuthenticated, isInitialized, resource, action, resourceId, roles]);

  // Show loading while auth is initializing
  if (!isInitialized) {
    return <LoadingState message="Initializing..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading while verifying permissions
  if (permissionState.isLoading) {
    return <LoadingState message="Verifying permissions..." />;
  }

  // Show access denied if verification failed or no access
  if (!permissionState.hasAccess) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-700 mb-4">
                  You don't have permission to access this content.
                </p>
                {permissionState.error && (
                  <p className="text-sm text-red-600 mb-4">
                    {permissionState.error}
                  </p>
                )}
                <div className="space-y-2">
                  <button
                    onClick={() => window.history.back()}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};