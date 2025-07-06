export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

export interface DecodedToken {
  userId: number;
  email: string;
  name: string;
  role: string;
  exp: number;
  iat: number;
}

export class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'library_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'library_refresh_token';
  private static readonly TOKEN_TYPE_KEY = 'library_token_type';
  private static readonly EXPIRES_AT_KEY = 'library_expires_at';

  /**
   * Store authentication tokens
   */
  static storeTokens(tokenData: TokenData): void {
    try {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenData.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refreshToken);
      localStorage.setItem(this.TOKEN_TYPE_KEY, tokenData.tokenType);
      localStorage.setItem(this.EXPIRES_AT_KEY, tokenData.expiresAt.toString());
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  /**
   * Get all stored token data
   */
  static getTokenData(): TokenData | null {
    try {
      const accessToken = this.getAccessToken();
      const refreshToken = this.getRefreshToken();
      const tokenType = localStorage.getItem(this.TOKEN_TYPE_KEY);
      const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);

      if (!accessToken || !refreshToken || !tokenType || !expiresAt) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        tokenType,
        expiresAt: parseInt(expiresAt, 10)
      };
    } catch (error) {
      console.error('Failed to get token data:', error);
      return null;
    }
  }

  /**
   * Check if access token is expired
   */
  static isTokenExpired(): boolean {
    try {
      const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
      if (!expiresAt) {
        return true;
      }

      const expiration = parseInt(expiresAt, 10);
      const now = Date.now();
      
      // Consider token expired if it expires within the next 5 minutes
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      return now >= (expiration - bufferTime);
    } catch (error) {
      console.error('Failed to check token expiration:', error);
      return true;
    }
  }

  /**
   * Decode JWT token (without verification - for client-side use only)
   */
  static decodeToken(token: string): DecodedToken | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload) as DecodedToken;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Get current user from token
   */
  static getCurrentUser(): DecodedToken | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }

    return this.decodeToken(token);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return token !== null && !this.isTokenExpired();
  }

  /**
   * Clear all stored tokens
   */
  static clearTokens(): void {
    try {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_TYPE_KEY);
      localStorage.removeItem(this.EXPIRES_AT_KEY);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Get authorization header value
   */
  static getAuthorizationHeader(): string | null {
    const token = this.getAccessToken();
    const tokenType = localStorage.getItem(this.TOKEN_TYPE_KEY) || 'Bearer';
    
    if (!token) {
      return null;
    }

    return `${tokenType} ${token}`;
  }
}