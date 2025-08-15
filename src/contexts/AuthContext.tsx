import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { AuthenticationService, AuthUser, LoginCredentials, RegisterData } from '../domain/services/Auth/AuthenticationService';
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

// FIXED: Auth reducer with better state management and validation
function authReducer(state: AuthState, action: AuthAction): AuthState {
  console.log('🔄 Auth Action:', action.type);
  
  switch (action.type) {
    case 'AUTH_INIT_START':
      return {
        ...state,
        isLoading: true,
        error: null,
        // Don't reset user during init to prevent flashing
      };

    case 'AUTH_INIT_SUCCESS':
      const initUser = action.payload.user;
      console.log('✅ Auth init success, user:', initUser?.email, 'role:', initUser?.role);
      
      // VALIDATION: Ensure user has valid role if user exists
      if (initUser && (!initUser.role || initUser.role.trim() === '')) {
        console.error('❌ Auth init success but user has no valid role, treating as failure');
        return {
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'User has no valid role',
          isInitialized: true,
        };
      }
      
      return {
        ...state,
        user: initUser,
        isAuthenticated: !!initUser,
        isLoading: false,
        error: null,
        isInitialized: true,
      };

    case 'AUTH_INIT_FAILURE':
      console.log('❌ Auth init failure:', action.payload.error);
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
      const successUser = action.payload.user;
      console.log('✅ Login/Register success, user:', successUser.email, 'role:', successUser.role);
      
      // VALIDATION: Ensure user has valid role
      if (!successUser.role || successUser.role.trim() === '') {
        console.error('❌ Login/Register success but user has no valid role');
        return {
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication failed - no user role',
        };
      }
      
      return {
        ...state,
        user: successUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      console.log('❌ Login/Register failure:', action.payload.error);
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case 'LOGOUT_SUCCESS':
      console.log('✅ Logout success');
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

  // FIXED: Stable initialization function with better validation
  const initializeAuth = useCallback(async () => {
    console.log('🔄 AuthProvider: Starting auth initialization...');
    dispatch({ type: 'AUTH_INIT_START' });

    try {
      // First check if we have a token
      const hasToken = authService.isAuthenticated();
      console.log('🔍 AuthProvider: Has valid token:', hasToken);
      
      if (!hasToken) {
        console.log('📝 AuthProvider: No valid token found, user not authenticated');
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
        return;
      }

      // Try to get current user from token first (faster)
      console.log('🔍 AuthProvider: Getting user from stored token...');
      const tokenUser = authService.getCurrentUserFromToken();
      
      if (tokenUser) {
        console.log('✅ AuthProvider: User found in token:', tokenUser.email, 'role:', tokenUser.role);
        
        // CRITICAL: Validate role exists
        if (!tokenUser.role || tokenUser.role.trim() === '') {
          console.error('❌ AuthProvider: Token user has no valid role, clearing auth');
          authService.clearAuthentication();
          dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
          return;
        }
        
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: tokenUser } });
        return;
      }

      // If token user fails, try server verification
      console.log('🔍 AuthProvider: Token user failed, trying server verification...');
      const result = await authService.getCurrentUser();
      
      if (result.isSuccess && result.value) {
        console.log('✅ AuthProvider: User verified from server:', result.value.email, 'role:', result.value.role);
        
        // CRITICAL: Validate server user has role
        if (!result.value.role || result.value.role.trim() === '') {
          console.error('❌ AuthProvider: Server user has no valid role, clearing auth');
          authService.clearAuthentication();
          dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
          return;
        }
        
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: result.value } });
      } else {
        console.log('❌ AuthProvider: Server verification failed, clearing auth');
        authService.clearAuthentication();
        dispatch({ type: 'AUTH_INIT_SUCCESS', payload: { user: null } });
      }
    } catch (error) {
      console.error('❌ AuthProvider: Auth initialization failed:', error);
      authService.clearAuthentication();
      dispatch({ type: 'AUTH_INIT_FAILURE', payload: { error: 'Authentication failed' } });
    }
  }, [authService]);

  // Initialize authentication on mount - ONLY ONCE
  useEffect(() => {
    console.log('🔄 AuthProvider: Mounting, initializing auth...');
    initializeAuth();
  }, []); // Empty dependency array - only run once

  // Debug state changes with role validation
  useEffect(() => {
    console.log('📊 Auth State Changed:', {
      isAuthenticated: state.isAuthenticated,
      isInitialized: state.isInitialized,
      isLoading: state.isLoading,
      userEmail: state.user?.email,
      userRole: state.user?.role,
      error: state.error
    });

    // VALIDATION: Alert if authenticated user has no role
    if (state.isAuthenticated && state.user && (!state.user.role || state.user.role.trim() === '')) {
      console.error('🚨 CRITICAL: Authenticated user has no role!', state.user);
      // Force logout to prevent permission issues
      logout();
    }
  }, [state]);

  // FIXED: Refresh authentication with role validation
  const refreshAuth = useCallback(async (): Promise<void> => {
    console.log('🔄 AuthProvider: Refreshing auth...');
    try {
      if (authService.needsTokenRefresh()) {
        const result = await authService.refreshAuthentication();
        
        if (result.isSuccess) {
          console.log('✅ AuthProvider: Token refresh successful');
          
          // Validate refreshed user has role
          if (!result.value.user.role || result.value.user.role.trim() === '') {
            console.error('❌ AuthProvider: Refreshed user has no role, logging out');
            dispatch({ type: 'LOGOUT_SUCCESS' });
            return;
          }
          
          dispatch({ type: 'REFRESH_TOKEN_SUCCESS', payload: { user: result.value.user } });
        } else {
          console.log('❌ AuthProvider: Token refresh failed');
          dispatch({ type: 'LOGOUT_SUCCESS' });
        }
      }
    } catch (error) {
      console.error('❌ AuthProvider: Refresh auth error:', error);
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  }, [authService]);

  // FIXED: Login function with role validation
  const login = useCallback(async (credentials: LoginCredentials): Promise<ControllerResult> => {
    console.log('🔐 AuthProvider: Starting login for:', credentials.email);
    dispatch({ type: 'LOGIN_START' });

    try {
      const result = await authService.login(credentials);

      if (result.isSuccess) {
        console.log('✅ AuthProvider: Login successful for:', result.value.user.email, 'role:', result.value.user.role);
        
        // CRITICAL: Validate login result has valid role
        if (!result.value.user.role || result.value.user.role.trim() === '') {
          console.error('❌ AuthProvider: Login result has no valid role');
          dispatch({ type: 'LOGIN_FAILURE', payload: { error: 'Authentication failed - no user role' } });
          return ControllerResult.failure('Authentication failed - no user role');
        }
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: result.value.user } });
        return ControllerResult.success(result.value.user);
      } else {
        console.log('❌ AuthProvider: Login failed:', result.error.message);
        dispatch({ type: 'LOGIN_FAILURE', payload: { error: result.error.message } });
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      console.error('❌ AuthProvider: Login error:', error);
      const errorMessage = error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
      return ControllerResult.failure(errorMessage);
    }
  }, [authService]);

  // FIXED: Register function with role validation
  const register = useCallback(async (userData: RegisterData): Promise<ControllerResult> => {
    console.log('🔐 AuthProvider: Starting registration for:', userData.email);
    dispatch({ type: 'REGISTER_START' });

    try {
      const result = await authService.register(userData);

      if (result.isSuccess) {
        console.log('✅ AuthProvider: Registration successful for:', result.value.user.email, 'role:', result.value.user.role);
        
        // CRITICAL: Validate registration result has valid role
        if (!result.value.user.role || result.value.user.role.trim() === '') {
          console.error('❌ AuthProvider: Registration result has no valid role');
          dispatch({ type: 'REGISTER_FAILURE', payload: { error: 'Registration failed - no user role' } });
          return ControllerResult.failure('Registration failed - no user role');
        }
        
        dispatch({ type: 'REGISTER_SUCCESS', payload: { user: result.value.user } });
        return ControllerResult.success(result.value.user);
      } else {
        console.log('❌ AuthProvider: Registration failed:', result.error.message);
        dispatch({ type: 'REGISTER_FAILURE', payload: { error: result.error.message } });
        return ControllerResult.failure(result.error.message);
      }
    } catch (error: any) {
      console.error('❌ AuthProvider: Registration error:', error);
      const errorMessage = error.message || 'Registration failed';
      dispatch({ type: 'REGISTER_FAILURE', payload: { error: errorMessage } });
      return ControllerResult.failure(errorMessage);
    }
  }, [authService]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    console.log('🔐 AuthProvider: Starting logout...');
    try {
      await authService.logout();
      console.log('✅ AuthProvider: Logout successful');
    } catch (error) {
      console.error('❌ AuthProvider: Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT_SUCCESS' });
    }
  }, [authService]);

  // Clear error
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // FIXED: Permission utilities with role validation
  const hasRole = useCallback((role: string): boolean => {
    if (!state.user?.role) {
      console.log('🔍 hasRole check: No user role available');
      return false;
    }
    
    const result = state.user.role === role;
    console.log('🔍 hasRole check:', { userRole: state.user.role, requiredRole: role, result });
    return result;
  }, [state.user?.role]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    if (!state.user?.role) {
      console.log('🔍 hasAnyRole check: No user role available');
      return false;
    }
    
    const result = roles.includes(state.user.role);
    console.log('🔍 hasAnyRole check:', { userRole: state.user.role, requiredRoles: roles, result });
    return result;
  }, [state.user?.role]);

  const canAccess = useCallback((resource: string, action: string): boolean => {
    if (!state.user?.role) {
      console.log('🔍 canAccess: No user role available, denying access');
      return false;
    }

    const permissions = ROLE_PERMISSIONS[state.user.role];
    if (!permissions) {
      console.log('🔍 canAccess: No permissions defined for role:', state.user.role);
      return false;
    }

    const result = permissions.resources.includes(resource) && permissions.actions.includes(action);
    console.log('🔍 canAccess check:', { 
      userRole: state.user.role, 
      resource, 
      action, 
      result 
    });
    return result;
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