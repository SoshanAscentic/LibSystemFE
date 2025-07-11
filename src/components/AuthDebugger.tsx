import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserPermissions } from '../hooks/useUserPermissions';

export const AuthDebugger: React.FC = () => {
  const auth = useAuth();
  const permissions = useUserPermissions();

  // Only show in development
  if (import.meta.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🔍 Auth Debug Info</div>
      
      <div className="space-y-1">
        <div>
          <strong>Auth State:</strong>
        </div>
        <div className="ml-2">
          • Initialized: {auth.isInitialized ? '✅' : '❌'}
        </div>
        <div className="ml-2">
          • Authenticated: {auth.isAuthenticated ? '✅' : '❌'}
        </div>
        <div className="ml-2">
          • Loading: {auth.isLoading ? '⏳' : '✅'}
        </div>
        <div className="ml-2">
          • Error: {auth.error || 'None'}
        </div>
        
        <div className="mt-2">
          <strong>User Info:</strong>
        </div>
        <div className="ml-2">
          • Email: {auth.user?.email || 'None'}
        </div>
        <div className="ml-2">
          • Role: {auth.user?.role || 'None'}
        </div>
        <div className="ml-2">
          • Full Name: {auth.user?.fullName || 'None'}
        </div>
        
        <div className="mt-2">
          <strong>Permissions:</strong>
        </div>
        <div className="ml-2">
          • Loading: {permissions.isLoading ? '⏳' : '✅'}
        </div>
        <div className="ml-2">
          • Can Add: {permissions.canAdd ? '✅' : '❌'}
        </div>
        <div className="ml-2">
          • Can Edit: {permissions.canEdit ? '✅' : '❌'}
        </div>
        <div className="ml-2">
          • Can Delete: {permissions.canDelete ? '✅' : '❌'}
        </div>
        <div className="ml-2">
          • Can Manage Users: {permissions.canManageUsers ? '✅' : '❌'}
        </div>
        
        <div className="mt-2">
          <strong>Token Info:</strong>
        </div>
        <div className="ml-2">
          • Has Token: {localStorage.getItem('library_access_token') ? '✅' : '❌'}
        </div>
        <div className="ml-2">
          • Token Length: {localStorage.getItem('library_access_token')?.length || 0}
        </div>
      </div>
      
      <button 
        onClick={() => {
          console.log('=== FULL AUTH DEBUG ===');
          console.log('Auth State:', auth);
          console.log('Permissions:', permissions);
          console.log('LocalStorage Token:', localStorage.getItem('library_access_token'));
          console.log('Current URL:', window.location.href);
          console.log('Navigation State:', window.history.state);
          console.log('======================');
        }}
        className="mt-2 bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
      >
        Log to Console
      </button>
    </div>
  );
};