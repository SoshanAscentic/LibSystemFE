export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

export class SecureTokenService {
  private static readonly TOKEN_ENDPOINT = '/api/auth/token'; // Backend endpoint for token operations

  /**
   * Store tokens securely using httpOnly cookies (via backend)
   */
  static async storeTokens(tokenData: TokenData): Promise<void> {
    try {
      console.log('SecureTokenService: Storing tokens securely...');
      
      // Send tokens to backend to set httpOnly cookies
      await fetch('/api/auth/set-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(tokenData)
      });
      
      console.log('SecureTokenService: Tokens stored securely in httpOnly cookies');
    } catch (error) {
      console.error('SecureTokenService: Failed to store tokens:', error);
      throw error;
    }
  }

  /**
   * Get access token (from httpOnly cookie via backend call)
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const response = await fetch('/api/auth/get-token', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.accessToken;
      }
      
      return null;
    } catch (error) {
      console.error('SecureTokenService: Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated (server-side verification)
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include'
      });
      
      return response.ok;
    } catch (error) {
      console.error('SecureTokenService: Authentication check failed:', error);
      return false;
    }
  }

  /**
   * Clear all tokens (via backend)
   */
  static async clearTokens(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      console.log('SecureTokenService: Tokens cleared');
    } catch (error) {
      console.error('SecureTokenService: Failed to clear tokens:', error);
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      
      return response.ok;
    } catch (error) {
      console.error('SecureTokenService: Token refresh failed:', error);
      return false;
    }
  }

  /**
   * FALLBACK ONLY: Use sessionStorage for development
   * I NEED TO REMOVE THIS WHEN IN PRODUCTION !!
   */
  private static readonly ACCESS_TOKEN_KEY = 'lib_access_token';
  
  static storeTokensSessionStorage(tokenData: TokenData): void {
    if (process.env.NODE_ENV === 'development') {
      sessionStorage.setItem(this.ACCESS_TOKEN_KEY, tokenData.accessToken);
    }
  }
  
  static getAccessTokenSessionStorage(): string | null {
    if (process.env.NODE_ENV === 'development') {
      return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }
  
  static clearTokensSessionStorage(): void {
    if (process.env.NODE_ENV === 'development') {
      sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    }
  }
}