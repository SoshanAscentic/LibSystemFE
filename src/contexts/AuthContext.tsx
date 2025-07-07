import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthenticationService, AuthUser, LoginCredentials, RegisterData } from '../domain/services/AuthenticationService';
import { ControllerResult } from '../shared/interfaces/common';
import { TokenService } from '@/infrastructure/services/TokenService';

// Auth State Types
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_INIT_START' }
  | { type: 'AUTH_INIT_SUCCESS'; payload: { user: AuthUser | null } }
  | { type: 'AUTH_INIT_FAILURE'; payload: { error: string } }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser } }
  | { type: 'LOGIN_FAILURE'; payload: { error: string } }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: { user: AuthUser } }
  | { type: 'REGISTER_FAILURE'; payload: { error: string } }
  | { type: 'LOGOUT_SUCCESS' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { user: AuthUser } }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_ERROR'; payload: { error: string } };

// Auth Context Type
interface AuthContextType {
  // State
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<ControllerResult>;
  register: (userData: RegisterData) => Promise<ControllerResult>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  
  // Utilities
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  console.log('Auth Action:', action.type, action);
  
  switch (action.type) {
    case 'AUTH_INIT_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_INIT_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
        error: null,
        isInitialized: true,
      };

    case 'AUTH_INIT_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
        isInitialized: true,
      };

    case 'LOGIN_START':
    case 'REGISTER_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case 'LOGOUT_SUCCESS':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload.error,
        isLoading: false,
      };

    default:
      return state;
  }
}

// Permission mappings
const ROLE_PERMISSIONS: Record<string, { resources: string[]; actions: string[] }> = {
  Member: {
    resources: ['books', 'borrowing'],
    actions: ['read', 'borrow']
  },
  MinorStaff: {
    resources: ['books', 'members', 'borrowing'],
    actions: ['read', 'create', 'update']
  },
  ManagementStaff: {
    resources: ['books', 'members', 'borrowing'],
    actions: ['read', 'create', 'update', 'delete', 'borrow']
  },
  Administrator: {
    resources: ['books', 'members', 'borrowing', 'users', 'settings'],
    actions: ['read', 'create', 'update', 'delete', 'borrow', 'manage']
  }
};

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
interface AuthProviderProps {
  children: React.ReactNode;
  authService: AuthenticationService;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, authService }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Refresh authentication - MOVED UP before initializeAuth
  const refreshAuth = React.useCallback(async (): Promise<void> => {
    console.log('AuthProvider: Refreshing auth...');
    try {
      if (authService.needsTokenRefresh()) {
        const result = await authService.refreshAuthentication();
        
        if (result.isSuccess) {
          console.log('AuthProvider: Token refresh successful');
          dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: { user: result.value.user } });
        } else {
          console.log('AuthProvider: Token refresh failed');
          dispatch({ type: 'LOGOUT_SUCCESS' });
        }
      }
    } catch (error) {
      console.error('AuthProvider: Refresh auth error:', error);
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  }, [authService]);

  // Initialize authentication state - WITH ROLE PRESERVATION
  const initializeAuth = React.useCallback(async () => {
    console.log('AuthProvider: Starting auth initialization...');
    dispatch({ type: 'AUTH_INIT_START' });

    try {
      // First, check if we have any tokens
      const hasTokens = TokenService.getAccessToken() && TokenService.getRefreshToken();
      
      if (!hasTokens) {
        console.log('AuthProvider: No tokens found');
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
        return;
      }

      if (authService.isAuthenticated()) {
        console.log('AuthProvider: User appears authenticated, getting user from token...');
        
        // Try to get current user from token first (fast)
        const tokenUser = authService.getCurrentUserFromToken();
        
        if (tokenUser) {
          console.log('AuthProvider: Got user from token:', tokenUser.email, 'with role:', tokenUser.role);
          
          // If token user has a non-Member role, trust it completely
          // Skip server verification that causes role to be lost
          if (tokenUser.role && tokenUser.role !== 'Member') {
            console.log('AuthProvider: Token has privileged role, skipping server verification to preserve role');
            dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: tokenUser } });
            return; // Exit early - don't call server
          }
          
          // Only for Member role or missing role, verify with server
          dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: tokenUser } });
          
          try {
            console.log('AuthProvider: Verifying Member role with server...');
            const result = await authService.getCurrentUser();
            if (result.isSuccess && result.value) {
              console.log('AuthProvider: Server verification successful for Member');
              dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: { user: result.value } });
            }
          } catch (error) {
            console.log('AuthProvider: Server verification failed, keeping token user');
            // Keep the token user - already dispatched above
          }
        } else {
          console.log('AuthProvider: No valid token user, trying refresh...');
          await refreshAuth();
        }
      } else {
        console.log('AuthProvider: User not authenticated');
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
      }
    } catch (error) {
      console.error('AuthProvider: Auth initialization failed:', error);
      authService.clearAuthentication();
      dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
    }
  }, [authService, refreshAuth]);

  // Initialize authentication on mount
  React.useEffect(() => {
    console.log('AuthProvider: Initializing authentication...');
    initializeAuth();
  }, [initializeAuth]);

  // Debug state changes
  React.useEffect(() => {
    console.log('Auth State Changed:', {
      isAuthenticated: state.isAuthenticated,
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
      user: state.user?.email,
      userRole: state.user?.role,
      error: state.error
    });
  }, [state.isAuthenticated, state.isInitialized, state.isLoading, state.user?.email, state.user?.role, state.error]);

  // Login function
  const login = React.useCallback(async (credentials: LoginCredentials): Promise<ControllerResult> => {
    console.log('AuthProvider: Starting login...', credentials.email);
    dispatch({ type: 'LOGIN_START' });

    try {
      const result = await authService.login(credentials);

      if (result.isSuccess) {
        console.log('AuthProvider: Login successful:', result.value.user.email);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: result.value.user } });
        return ControllerResult.success(result.value.user);
      } else {
        console.log('AuthProvider: Login failed:', result.error.message);
        dispatch({ type: 'LOGIN_FAILURE', payload: { error: result.error.message } });
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      console.error('AuthProvider: Login error:', error);
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
      return ControllerResult.failure(errorMessage);
    }
  }, [authService]);

  // Register function
  const register = React.useCallback(async (userData: RegisterData): Promise<ControllerResult> => {
    console.log('AuthProvider: Starting registration...', userData.email);
    dispatch({ type: 'REGISTER_START' });

    try {
      const result = await authService.register(userData);

      if (result.isSuccess) {
        console.log('AuthProvider: Registration successful:', result.value.user.email);
        dispatch({ type: 'REGISTER_SUCCESS', payload: { user: result.value.user } });
        return ControllerResult.success(result.value.user);
      } else {
        console.log('AuthProvider: Registration failed:', result.error.message);
        dispatch({ type: 'REGISTER_FAILURE', payload: { error: result.error.message } });
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      console.error('AuthProvider: Registration error:', error);
      const errorMessage = error.message || 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: { error: errorMessage } });
      return ControllerResult.failure(errorMessage);
    }
  }, [authService]);

  // Logout function
  const logout = React.useCallback(async (): Promise<void> => {
    console.log('AuthProvider: Starting logout...');
    try {
      await authService.logout();
      console.log('AuthProvider: Logout successful');
    } catch (error) {
      console.error('AuthProvider: Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  }, [authService]);

  // Clear error
  const clearError = React.useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Permission utilities
  const hasRole = React.useCallback((role: string): boolean => {
    return state.user?.role === role;
  }, [state.user?.role]);

  const hasAnyRole = React.useCallback((roles: string[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  }, [state.user?.role]);

  const canAccess = React.useCallback((resource: string, action: string): boolean => {
    if (!state.user) return false;

    const permissions = ROLE_PERMISSIONS[state.user.role];
    if (!permissions) return false;

    return permissions.resources.includes(resource) && permissions.actions.includes(action);
  }, [state.user?.role]);

  // Context value
  const contextValue: AuthContextType = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized,

    // Actions
    login,
    register,
    logout,
    refreshAuth,
    clearError,

    // Utilities
    hasRole,
    hasAnyRole,
    canAccess,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};