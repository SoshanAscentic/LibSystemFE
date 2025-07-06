import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingState } from './molecules/LoadingState';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  resource?: string;
  action?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  resource,
  action,
  fallback
}) => {
  const { isAuthenticated, isInitialized, hasAnyRole, canAccess } = useAuth();
  const location = useLocation();

  // Show loading while auth is initializing
  if (!isInitialized) {
    return <LoadingState message="Initializing..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles && !hasAnyRole(roles)) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Check resource-based access
  if (resource && action && !canAccess(resource, action)) {
    return (
      <>
        {fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Permissions</h2>
              <p className="text-gray-600">You don't have permission to {action} {resource}.</p>
            </div>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
};