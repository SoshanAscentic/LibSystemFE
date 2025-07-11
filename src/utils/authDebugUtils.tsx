import { TokenService } from '../infrastructure/services/TokenService';

/**
 * Comprehensive authentication debugging utility
 * Helps identify where roles are being lost in the auth flow
 */
export class AuthDebugUtility {
  
  /**
   * Perform comprehensive auth system check
   */
  static async performFullAuthCheck(): Promise<{
    summary: string;
    issues: string[];
    recommendations: string[];
    details: any;
  }> {
    console.group('🔍 COMPREHENSIVE AUTH SYSTEM CHECK');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    const details: any = {};

    try {
      // 1. Check token existence and validity
      console.log('📋 Step 1: Checking token existence...');
      const tokenInfo = this.checkTokens();
      details.tokens = tokenInfo;
      
      if (!tokenInfo.hasAccessToken) {
        issues.push('No access token found in localStorage');
        recommendations.push('User needs to log in again');
      }

      // 2. Check token decoding
      console.log('📋 Step 2: Checking token decoding...');
      const decodingInfo = this.checkTokenDecoding();
      details.decoding = decodingInfo;
      
      if (decodingInfo.canDecode && !decodingInfo.hasRole) {
        issues.push('Token can be decoded but has no role');
        recommendations.push('Check JWT token claims configuration on the server');
      }
      
      if (!decodingInfo.canDecode && tokenInfo.hasAccessToken) {
        issues.push('Token exists but cannot be decoded');
        recommendations.push('Token may be corrupted or in wrong format');
      }

      // 3. Check authentication service state
      console.log('📋 Step 3: Checking authentication service...');
      const authServiceInfo = await this.checkAuthenticationService();
      details.authService = authServiceInfo;
      
      if (!authServiceInfo.isAuthenticated && tokenInfo.hasAccessToken) {
        issues.push('Has token but AuthenticationService says not authenticated');
        recommendations.push('Check TokenService.isAuthenticated() logic');
      }

      // 4. Check server connectivity
      console.log('📋 Step 4: Checking server connectivity...');
      const serverInfo = await this.checkServerConnectivity();
      details.server = serverInfo;
      
      if (!serverInfo.canConnect) {
        issues.push('Cannot connect to authentication server');
        recommendations.push('Check API_BASE_URL and server status');
      }

      // 5. Check localStorage integrity
      console.log('📋 Step 5: Checking localStorage integrity...');
      const storageInfo = this.checkStorageIntegrity();
      details.storage = storageInfo;
      
      if (storageInfo.hasCorruptedData) {
        issues.push('localStorage contains corrupted authentication data');
        recommendations.push('Clear localStorage and re-authenticate');
      }

      // 6. Generate summary
      let summary = '✅ Authentication system appears healthy';
      if (issues.length > 0) {
        summary = `❌ Found ${issues.length} issue(s) with authentication system`;
      }

      console.log('📊 Auth Check Summary:', summary);
      console.log('🚨 Issues Found:', issues);
      console.log('💡 Recommendations:', recommendations);

    } catch (error) {
      console.error('❌ Auth check failed:', error);
      issues.push(`Auth check failed: ${error}`);
      recommendations.push('Contact support with debug logs');
    }

    console.groupEnd();

    return {
      summary: issues.length === 0 ? '✅ Authentication system healthy' : `❌ ${issues.length} issues found`,
      issues,
      recommendations,
      details
    };
  }

  /**
   * Check token existence and basic properties
   */
  static checkTokens(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    tokenLength: number;
    tokenFormat: string;
    expiresAt: string | null;
  } {
    const accessToken = localStorage.getItem('library_access_token');
    const refreshToken = localStorage.getItem('library_refresh_token');
    const expiresAt = localStorage.getItem('library_expires_at');

    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      tokenLength: accessToken?.length || 0,
      tokenFormat: accessToken?.split('.').length === 3 ? 'JWT' : 'Unknown',
      expiresAt: expiresAt ? new Date(parseInt(expiresAt)).toISOString() : null
    };
  }

  /**
   * Check token decoding and role extraction
   */
  static checkTokenDecoding(): {
    canDecode: boolean;
    hasRole: boolean;
    role: string | null;
    userId: number | null;
    email: string | null;
    exp: number | null;
    allClaims: string[];
    error: string | null;
  } {
    try {
      const token = localStorage.getItem('library_access_token');
      if (!token) {
        return {
          canDecode: false,
          hasRole: false,
          role: null,
          userId: null,
          email: null,
          exp: null,
          allClaims: [],
          error: 'No token available'
        };
      }

      const decoded = TokenService.decodeToken(token);
      if (!decoded) {
        return {
          canDecode: false,
          hasRole: false,
          role: null,
          userId: null,
          email: null,
          exp: null,
          allClaims: [],
          error: 'Token decode failed'
        };
      }

      // Extract all claim names from the token
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const allClaims = Object.keys(payload);

      return {
        canDecode: true,
        hasRole: !!(decoded.role && decoded.role.trim()),
        role: decoded.role || null,
        userId: decoded.userId || null,
        email: decoded.email || null,
        exp: decoded.exp || null,
        allClaims,
        error: null
      };
    } catch (error) {
      return {
        canDecode: false,
        hasRole: false,
        role: null,
        userId: null,
        email: null,
        exp: null,
        allClaims: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check authentication service state
   */
  static async checkAuthenticationService(): Promise<{
    isAuthenticated: boolean;
    currentUser: any;
    error: string | null;
  }> {
    try {
      // We can't directly import the service here, so we'll check the TokenService
      const isAuthenticated = TokenService.isAuthenticated();
      const currentUser = TokenService.getCurrentUser();

      return {
        isAuthenticated,
        currentUser,
        error: null
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        currentUser: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check server connectivity
   */
  static async checkServerConnectivity(): Promise<{
    canConnect: boolean;
    responseTime: number | null;
    error: string | null;
  }> {
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7033';
      const startTime = Date.now();
      
      const response = await fetch(`${baseURL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Short timeout for quick check
        signal: AbortSignal.timeout(5000)
      });

      const responseTime = Date.now() - startTime;

      return {
        canConnect: response.ok,
        responseTime,
        error: response.ok ? null : `HTTP ${response.status}`
      };
    } catch (error) {
      return {
        canConnect: false,
        responseTime: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check localStorage integrity
   */
  static checkStorageIntegrity(): {
    hasCorruptedData: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    try {
      // Check if localStorage is accessible
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
    } catch (error) {
      issues.push('localStorage is not accessible');
      return { hasCorruptedData: true, issues };
    }

    // Check token consistency
    const accessToken = localStorage.getItem('library_access_token');
    const expiresAt = localStorage.getItem('library_expires_at');

    if (accessToken && !expiresAt) {
      issues.push('Has access token but no expiration time');
    }

    if (expiresAt) {
      try {
        const expTime = parseInt(expiresAt);
        if (isNaN(expTime)) {
          issues.push('Expiration time is not a valid number');
        } else if (expTime < Date.now() - (30 * 24 * 60 * 60 * 1000)) {
          issues.push('Expiration time is suspiciously old');
        }
      } catch (error) {
        issues.push('Cannot parse expiration time');
      }
    }

    return {
      hasCorruptedData: issues.length > 0,
      issues
    };
  }

  /**
   * Quick role validation check
   */
  static validateCurrentRole(): {
    hasValidRole: boolean;
    currentRole: string | null;
    roleSource: string;
    issues: string[];
  } {
    const issues: string[] = [];
    
    try {
      const currentUser = TokenService.getCurrentUser();
      
      if (!currentUser) {
        issues.push('No current user available');
        return {
          hasValidRole: false,
          currentRole: null,
          roleSource: 'none',
          issues
        };
      }

      if (!currentUser.role) {
        issues.push('User exists but has no role property');
        return {
          hasValidRole: false,
          currentRole: null,
          roleSource: 'token',
          issues
        };
      }

      if (currentUser.role.trim() === '') {
        issues.push('User has empty role string');
        return {
          hasValidRole: false,
          currentRole: currentUser.role,
          roleSource: 'token',
          issues
        };
      }

      const validRoles = ['Member', 'MinorStaff', 'ManagementStaff', 'Administrator'];
      if (!validRoles.includes(currentUser.role)) {
        issues.push(`Role '${currentUser.role}' is not in valid roles list`);
      }

      return {
        hasValidRole: issues.length === 0,
        currentRole: currentUser.role,
        roleSource: 'token',
        issues
      };
    } catch (error) {
      issues.push(`Role validation failed: ${error}`);
      return {
        hasValidRole: false,
        currentRole: null,
        roleSource: 'error',
        issues
      };
    }
  }

  /**
   * Emergency auth reset
   */
  static emergencyAuthReset(): void {
    console.warn('🚨 EMERGENCY AUTH RESET - Clearing all authentication data');
    
    try {
      // Clear all auth-related localStorage items
      const authKeys = [
        'library_access_token',
        'library_refresh_token', 
        'library_token_type',
        'library_expires_at'
      ];
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Cleared: ${key}`);
      });

      // Clear any other potentially related items
      Object.keys(localStorage).forEach(key => {
        if (key.includes('auth') || key.includes('token') || key.includes('user')) {
          localStorage.removeItem(key);
          console.log(`Cleared: ${key}`);
        }
      });

      console.log('✅ Emergency auth reset completed');
      console.log('🔄 Please refresh the page and log in again');
      
    } catch (error) {
      console.error('❌ Emergency auth reset failed:', error);
    }
  }

  /**
   * Generate detailed auth report
   */
  static async generateAuthReport(): Promise<string> {
    const fullCheck = await this.performFullAuthCheck();
    const roleValidation = this.validateCurrentRole();
    
    const report = `
=== AUTHENTICATION SYSTEM REPORT ===
Generated: ${new Date().toISOString()}

SUMMARY: ${fullCheck.summary}

ROLE VALIDATION:
- Has Valid Role: ${roleValidation.hasValidRole}
- Current Role: ${roleValidation.currentRole || 'None'}
- Role Source: ${roleValidation.roleSource}

ISSUES FOUND:
${fullCheck.issues.length > 0 ? fullCheck.issues.map(issue => `- ${issue}`).join('\n') : 'None'}

ROLE ISSUES:
${roleValidation.issues.length > 0 ? roleValidation.issues.map(issue => `- ${issue}`).join('\n') : 'None'}

RECOMMENDATIONS:
${fullCheck.recommendations.length > 0 ? fullCheck.recommendations.map(rec => `- ${rec}`).join('\n') : 'None'}

DETAILED INFO:
${JSON.stringify(fullCheck.details, null, 2)}

=== END REPORT ===
    `.trim();

    console.log(report);
    return report;
  }

  /**
   * Real-time auth monitoring
   */
  static startAuthMonitoring(): () => void {
    console.log('🔍 Starting real-time auth monitoring...');
    
    let lastRole: string | null = null;
    let lastAuthState: boolean | null = null;

    const monitor = () => {
      try {
        const currentUser = TokenService.getCurrentUser();
        const isAuthenticated = TokenService.isAuthenticated();
        
        const currentRole = currentUser?.role || null;
        
        // Check for role changes
        if (lastRole !== currentRole) {
          console.warn('🚨 ROLE CHANGE DETECTED:', {
            from: lastRole,
            to: currentRole,
            timestamp: new Date().toISOString(),
            user: currentUser?.email
          });
          lastRole = currentRole;
        }

        // Check for auth state changes
        if (lastAuthState !== isAuthenticated) {
          console.warn('🚨 AUTH STATE CHANGE DETECTED:', {
            from: lastAuthState,
            to: isAuthenticated,
            timestamp: new Date().toISOString()
          });
          lastAuthState = isAuthenticated;
        }

        // Check for role-related issues
        if (isAuthenticated && !currentRole) {
          console.error('🚨 AUTHENTICATED USER HAS NO ROLE!', {
            isAuthenticated,
            user: currentUser,
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('Auth monitoring error:', error);
      }
    };

    // Initial check
    monitor();
    
    // Set up periodic monitoring
    const interval = setInterval(monitor, 2000); // Check every 2 seconds
    
    // Return cleanup function
    return () => {
      console.log('🔍 Stopping auth monitoring');
      clearInterval(interval);
    };
  }
}

// Make available globally in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).authDebug = AuthDebugUtility;
  console.log('🔧 Auth debugging tools available at window.authDebug');
  console.log('📋 Available methods:');
  console.log('  • window.authDebug.performFullAuthCheck() - Complete system check');
  console.log('  • window.authDebug.validateCurrentRole() - Check current role validity');
  console.log('  • window.authDebug.generateAuthReport() - Generate detailed report');
  console.log('  • window.authDebug.emergencyAuthReset() - Clear all auth data');
  console.log('  • window.authDebug.startAuthMonitoring() - Monitor auth changes');
}