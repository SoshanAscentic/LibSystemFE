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
  sub?: string;
  nameid?: string;
  unique_name?: string;
  given_name?: string;
  family_name?: string;
  fullName?: string;
  [key: string]: any; // Allow for additional claims
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
      console.log('TokenService: Storing tokens...', {
        tokenType: tokenData.tokenType,
        accessTokenLength: tokenData.accessToken?.length,
        refreshTokenLength: tokenData.refreshToken?.length,
        expiresAt: new Date(tokenData.expiresAt).toISOString()
      });

      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokenData.accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokenData.refreshToken);
      localStorage.setItem(this.TOKEN_TYPE_KEY, tokenData.tokenType);
      localStorage.setItem(this.EXPIRES_AT_KEY, tokenData.expiresAt.toString());
      
      console.log('TokenService: Tokens stored successfully');
    } catch (error) {
      console.error('TokenService: Failed to store tokens:', error);
    }
  }

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    try {
      const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      if (token) {
        console.log('TokenService: Retrieved access token, length:', token.length);
      }
      return token;
    } catch (error) {
      console.error('TokenService: Failed to get access token:', error);
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
      console.error('TokenService: Failed to get refresh token:', error);
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
        console.log('TokenService: Missing token data components');
        return null;
      }

      return {
        accessToken,
        refreshToken,
        tokenType,
        expiresAt: parseInt(expiresAt, 10)
      };
    } catch (error) {
      console.error('TokenService: Failed to get token data:', error);
      return null;
    }
  }

  /**
   * Check if access token is expired
   */
  static isTokenExpired(): boolean {
    try {
      const token = this.getAccessToken();
      if (!token) {
        console.log('TokenService: No token found, considering expired');
        return true;
      }

      // First check localStorage expiration (faster)
      const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
      if (expiresAt) {
        const expiration = parseInt(expiresAt, 10);
        const now = Date.now();
        
        // Consider token expired if it expires within the next 5 minutes
        const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        if (now >= (expiration - bufferTime)) {
          console.log('TokenService: Token expired based on localStorage timestamp');
          return true;
        }
      }

      // Try to decode token to double-check (only if it looks like a JWT)
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const decoded = this.decodeToken(token);
          if (decoded && decoded.exp) {
            const now = Math.floor(Date.now() / 1000);
            const bufferTime = 5 * 60; // 5 minutes in seconds
            
            if (now >= (decoded.exp - bufferTime)) {
              console.log('TokenService: Token expired based on JWT exp claim');
              return true;
            }
          }
        } catch (decodeError) {
          console.warn('TokenService: Could not decode token for expiration check, using localStorage value');
        }
      }

      console.log('TokenService: Token appears to be valid');
      return false;
    } catch (error) {
      console.error('TokenService: Failed to check token expiration:', error);
      return true;
    }
  }

  /**
   * Decode JWT token (without verification - for client-side use only) - Enhanced for backend JWT format
   */
  static decodeToken(token: string): DecodedToken | null {
    try {
      // Validate token format first
      if (!token || typeof token !== 'string') {
        console.warn('TokenService: Invalid token - not a string:', typeof token);
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('TokenService: Invalid token format - expected 3 parts, got:', parts.length);
        console.log('TokenService: Token preview:', token.substring(0, 50) + '...');
        return null;
      }

      const base64Url = parts[1];
      if (!base64Url) {
        console.warn('TokenService: Invalid token - missing payload section');
        return null;
      }

      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const payload = JSON.parse(jsonPayload);
      console.log('TokenService: Decoded JWT payload:', payload);
      
      // Enhanced role extraction - check multiple possible claim names
      const extractRole = (payload: any): string => {
        const possibleRoleClaims = [
          'role',
          'roles', 
          'Role',
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role',
          'custom:role',
          'user_role',
          'userRole',
          'memberType',
          'MemberType'
        ];
        
        for (const claim of possibleRoleClaims) {
          if (payload[claim]) {
            const roleValue = payload[claim];
            // Handle if roles is an array (take first role)
            if (Array.isArray(roleValue)) {
              console.log(`TokenService: Found role in ${claim} (array):`, roleValue[0]);
              return roleValue[0];
            }
            console.log(`TokenService: Found role in ${claim}:`, roleValue);
            return roleValue;
          }
        }
        
        console.warn('TokenService: No role found in token claims. Available claims:', Object.keys(payload));
        console.log('TokenService: Full payload for debugging:', payload);
        return 'Member'; // Default fallback
      };

      // Enhanced name extraction
      const extractName = (payload: any): string => {
        console.log('TokenService: Extracting name from payload...');
        
        // 1. Try fullName if it exists and is not just email
        if (payload.fullName && payload.fullName !== payload.email) {
          console.log('TokenService: Using fullName:', payload.fullName);
          return payload.fullName;
        }
        
        // 2. Build from given name and surname claims (your JWT structure)
        const givenName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || payload.given_name;
        const surname = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || payload.family_name;
        
        if (givenName && surname) {
          const fullName = `${givenName} ${surname}`.trim();
          console.log('TokenService: Built name from JWT claims:', fullName);
          return fullName;
        }
        
        // 3. Try individual name fields
        if (givenName) {
          console.log('TokenService: Using given name only:', givenName);
          return givenName;
        }
        
        // 4. Try standard name claim (but not if it's just the email)
        const standardName = payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        if (standardName && standardName !== payload.email) {
          console.log('TokenService: Using standard name claim:', standardName);
          return standardName;
        }
        
        // 5. Fallback to email username
        if (payload.email) {
          const emailName = payload.email.split('@')[0];
          console.log('TokenService: Using email username as fallback:', emailName);
          return emailName;
        }
        
        console.log('TokenService: No name found, using fallback');
        return 'Unknown User';
      };

      // Map various possible claim names to our standard interface
      const decoded: DecodedToken = {
        // User ID - enhanced extraction
        userId: parseInt(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']) || 
                parseInt(payload.sub) || 
                parseInt(payload.userId) || 
                parseInt(payload.id) || 
                parseInt(payload.nameid) ||
                0,
        
        // Email extraction
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
               payload.email || 
               payload.unique_name ||
               '',
               
        // Enhanced name extraction
        name: extractName(payload),
        
        // Use enhanced role extraction
        role: extractRole(payload),
              
        exp: payload.exp,
        iat: payload.iat || Math.floor(Date.now() / 1000),
        
        // Store processed name parts for AuthUser mapping
        given_name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || payload.given_name,
        family_name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || payload.family_name,
        fullName: extractName(payload), // Store the extracted full name
        
        // Store original claims for debugging
        sub: payload.sub,
        nameid: payload.nameid,
        unique_name: payload.unique_name,
        ...payload // Include all other claims
      };
      
      console.log('TokenService: Final decoded user with name:', decoded.name, 'and role:', decoded.role);
      
      // Validate that we have minimum required fields
      if (!decoded.userId && !decoded.email) {
        console.warn('TokenService: Token payload missing required user identification');
        console.warn('TokenService: Available payload keys:', Object.keys(payload));
        return null;
      }

      console.log('TokenService: Successfully decoded token for user:', decoded.email, 'with role:', decoded.role);
      return decoded;
    } catch (error) {
      console.error('TokenService: Failed to decode token:', error);
      console.log('TokenService: Problematic token preview:', token?.substring(0, 100));
      return null;
    }
  }

  /**
   * Get current user from token
   */
  static getCurrentUser(): DecodedToken | null {
    try {
      const token = this.getAccessToken();
      if (!token) {
        console.log('TokenService: No access token available');
        return null;
      }

      return this.decodeToken(token);
    } catch (error) {
      console.error('TokenService: Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    try {
      const token = this.getAccessToken();
      if (!token) {
        console.log('TokenService: No access token found');
        return false;
      }

      // Check if token is expired first (this is faster)
      if (this.isTokenExpired()) {
        console.log('TokenService: Token is expired');
        return false;
      }

      // If token exists and is not expired, consider user authenticated
      console.log('TokenService: User appears to be authenticated');
      return true;
    } catch (error) {
      console.error('TokenService: Failed to check authentication:', error);
      return false;
    }
  }

  /**
   * Clear all stored tokens
   */
  static clearTokens(): void {
    try {
      console.log('TokenService: Clearing all tokens');
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_TYPE_KEY);
      localStorage.removeItem(this.EXPIRES_AT_KEY);
      console.log('TokenService: Tokens cleared successfully');
    } catch (error) {
      console.error('TokenService: Failed to clear tokens:', error);
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

  /**
   * Check if we have any tokens stored (regardless of validity)
   */
  static hasTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return !!(accessToken && refreshToken);
  }

  /**
   * Get token info for debugging
   */
  static getTokenInfo(): any {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return { hasToken: false };
      }

      const parts = token.split('.');
      const tokenType = localStorage.getItem(this.TOKEN_TYPE_KEY);
      const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);

      return {
        hasToken: true,
        tokenLength: token.length,
        tokenType,
        isJWT: parts.length === 3,
        parts: parts.length,
        expiresAt: expiresAt ? new Date(parseInt(expiresAt, 10)).toISOString() : null,
        preview: token.substring(0, 20) + '...'
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }
}