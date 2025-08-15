import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingState } from './molecules/LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  fallback
}) => {
  const { isAuthenticated, isInitialized, user, isLoading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute: Checking access...', {
    isAuthenticated,
    isInitialized,
    isLoading,
    userRole: user?.role,
    requiredRoles: roles,
    pathname: location.pathname
  });

  // IMPORTANT: Wait for auth to be fully initialized
  if (!isInitialized || isLoading) {
    console.log('⏳ ProtectedRoute: Auth initializing, showing loading...');
    return <LoadingState message="Initializing authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('❌ ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  if (roles && roles.length > 0 && user) {
    const hasRequiredRole = roles.includes(user.role);
    console.log('🔍 ProtectedRoute: Role check result:', {
      userRole: user.role,
      requiredRoles: roles,
      hasAccess: hasRequiredRole
    });

    if (!hasRequiredRole) {
      return (
        <>
          {fallback || (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                  <p className="text-gray-700 mb-4">
                    You don't have permission to access this content.
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Required role: {roles.join(' or ')}<br/>
                    Your role: {user.role}
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => window.history.back()}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
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
  }

  console.log('ProtectedRoute: Access granted');
  return <>{children}</>;
};