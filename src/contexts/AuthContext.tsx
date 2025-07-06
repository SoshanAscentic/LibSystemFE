import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthenticationService, AuthUser, LoginCredentials, RegisterData } from '../domain/services/AuthenticationService';
import { ControllerResult } from '../shared/interfaces/common';

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

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication state
  const initializeAuth = async () => {
    dispatch({ type: 'AUTH_INIT_START' });

    try {
      if (authService.isAuthenticated()) {
        // Try to get current user from token first (fast)
        const tokenUser = authService.getCurrentUserFromToken();
        
        if (tokenUser) {
          dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: tokenUser } });
          
          // Then verify with server (background)
          try {
            const result = await authService.getCurrentUser();
            if (result.isSuccess && result.value) {
              dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: { user: result.value } });
            }
          } catch (error) {
            // If server verification fails, try token refresh
            await refreshAuth();
          }
        } else {
          // No valid token, try refresh
          await refreshAuth();
        }
      } else {
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
      }
    } catch (error) {
      dispatch({ type: 'AUTH_INIT_FAILURE', payload: { error: 'Failed to initialize authentication' } });
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<ControllerResult> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const result = await authService.login(credentials);

      if (result.isSuccess) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: result.value.user } });
        return ControllerResult.success(result.value.user);
      } else {
        dispatch({ type: 'LOGIN_FAILURE', payload: { error: result.error.message } });
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
      return ControllerResult.failure(errorMessage);
    }
  };

  // Register function
  const register = async (userData: RegisterData): Promise<ControllerResult> => {
    dispatch({ type: 'REGISTER_START' });

    try {
      const result = await authService.register(userData);

      if (result.isSuccess) {
        dispatch({ type: 'REGISTER_SUCCESS', payload: { user: result.value.user } });
        return ControllerResult.success(result.value.user);
      } else {
        dispatch({ type: 'REGISTER_FAILURE', payload: { error: result.error.message } });
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: { error: errorMessage } });
      return ControllerResult.failure(errorMessage);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  };

  // Refresh authentication
  const refreshAuth = async (): Promise<void> => {
    try {
      if (authService.needsTokenRefresh()) {
        const result = await authService.refreshAuthentication();
        
        if (result.isSuccess) {
          dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: { user: result.value.user } });
        } else {
          dispatch({ type: 'LOGOUT_SUCCESS' });
        }
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  };

  // Clear error
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Permission utilities
  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return state.user ? roles.includes(state.user.role) : false;
  };

  const canAccess = (resource: string, action: string): boolean => {
    if (!state.user) return false;

    const permissions = ROLE_PERMISSIONS[state.user.role];
    if (!permissions) return false;

    return permissions.resources.includes(resource) && permissions.actions.includes(action);
  };

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

// Higher-order component for auth protection
interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  roles?: string[];
  resource?: string;
  action?: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  fallback = <div>Unauthorized</div>,
  roles,
  resource,
  action
}) => {
  const { isAuthenticated, isInitialized, hasAnyRole, canAccess } = useAuth();

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (roles && !hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  if (resource && action && !canAccess(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};