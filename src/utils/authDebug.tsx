import { TokenService } from '../infrastructure/services/TokenService';

export class AuthDebugTools {
  /**
   * Clear all authentication data (useful for troubleshooting)
   */
  static clearAllAuthData(): void {
    try {
      TokenService.clearTokens();
      console.log('All authentication data cleared');
    } catch (error) {
      console.error('❌ Failed to clear auth data:', error);
    }
  }

  /**
   * Get detailed authentication status
   */
  static getAuthStatus(): {
    hasAccessToken: boolean;
    hasRefreshToken: boolean;
    tokenValid: boolean;
    isAuthenticated: boolean;
    tokenData: any;
    userFromToken: any;
    error?: string;
  } {
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

  /**
   * Print authentication debug info to console
   */
  static debugAuth(): void {
    const status = this.getAuthStatus();
    console.group('Authentication Debug Info');
    console.log('Has Access Token:', status.hasAccessToken);
    console.log('Has Refresh Token:', status.hasRefreshToken);
    console.log('Token Valid:', status.tokenValid);
    console.log('Is Authenticated:', status.isAuthenticated);
    console.log('Token Data:', status.tokenData);
    console.log('User from Token:', status.userFromToken);
    if (status.error) {
      console.error('Error:', status.error);
    }
    console.groupEnd();
  }

  /**
   * Check if there are any invalid tokens that need clearing
   */
  static checkAndFixInvalidTokens(): boolean {
    const status = this.getAuthStatus();
    
    if ((status.hasAccessToken || status.hasRefreshToken) && !status.tokenValid) {
      console.warn('⚠️ Found invalid tokens, clearing...');
      this.clearAllAuthData();
      return true;
    }
    
    return false;
  }
}

// Add to window for easy debugging in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).authDebug = AuthDebugTools;
  console.log('Auth debug tools available at window.authDebug');
}