import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TokenService } from '../infrastructure/services/TokenService';

interface AuthDebugStatus {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  tokenValid: boolean;
  isAuthenticated: boolean;
  tokenData: any;
  userFromToken: any;
  error?: string;
}

function getAuthStatus(): AuthDebugStatus {
  try {
    const accessToken = TokenService.getAccessToken();
    const refreshToken = TokenService.getRefreshToken();
    const tokenData = TokenService.getTokenData();
    
    let tokenValid = false;
    let userFromToken = null;
    let error: string | undefined;

    try {
      userFromToken = TokenService.getCurrentUser();
      tokenValid = !!userFromToken && !TokenService.isTokenExpired();
    } catch (e: any) {
      error = e.message;
    }

    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      tokenValid,
      isAuthenticated: TokenService.isAuthenticated(),
      tokenData: tokenData ? {
        expiresAt: new Date(tokenData.expiresAt).toISOString(),
        tokenType: tokenData.tokenType
      } : null,
      userFromToken,
      error
    };
  } catch (error: any) {
    return {
      hasAccessToken: false,
      hasRefreshToken: false,
      tokenValid: false,
      isAuthenticated: false,
      tokenData: null,
      userFromToken: null,
      error: error.message
    };
  }
}

export const AuthDebug: React.FC = () => {
  const auth = useAuth();
  const [authStatus, setAuthStatus] = React.useState(getAuthStatus());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setAuthStatus(getAuthStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClearTokens = () => {
    TokenService.clearTokens();
    window.location.reload();
  };

  const handleDebugToConsole = () => {
    console.group('Authentication Debug Info');
    console.log('Auth State:', {
      isAuthenticated: auth.isAuthenticated,
      isInitialized: auth.isInitialized,
      isLoading: auth.isLoading,
      user: auth.user?.email,
      error: auth.error
    });
    console.log('Token Status:', authStatus);
    console.groupEnd();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Auth Debug</h3>
        <div className="flex gap-1">
          <button 
            onClick={handleDebugToConsole}
            className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700"
          >
            Console
          </button>
          <button 
            onClick={handleClearTokens}
            className="bg-red-600 px-2 py-1 rounded text-xs hover:bg-red-700"
          >
            Clear
          </button>
        </div>
      </div>
      
      <div className="space-y-1">
        <div><strong>Auth State:</strong></div>
        <div>• Authenticated: {auth.isAuthenticated ? '✅' : '❌'}</div>
        <div>• Initialized: {auth.isInitialized ? '✅' : '❌'}</div>
        <div>• Loading: {auth.isLoading ? '⏳' : '✅'}</div>
        <div>• User: {auth.user?.email || 'None'}</div>
        <div>• Error: {auth.error || 'None'}</div>
        
        <div className="mt-2"><strong>Token Status:</strong></div>
        <div>• Access Token: {authStatus.hasAccessToken ? '✅' : '❌'}</div>
        <div>• Refresh Token: {authStatus.hasRefreshToken ? '✅' : '❌'}</div>
        <div>• Token Valid: {authStatus.tokenValid ? '✅' : '❌'}</div>
        
        {authStatus.error && (
          <div className="mt-2 p-2 bg-red-600 rounded text-xs">
            <strong>Error:</strong> {authStatus.error}
          </div>
        )}
        
        {authStatus.tokenData && (
          <div className="mt-2 text-xs">
            <div>• Expires: {new Date(authStatus.tokenData.expiresAt).toLocaleTimeString()}</div>
          </div>
        )}
      </div>
    </div>
  );
};