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
   * FIXED: Enhanced role extraction with better error handling and no fallback to 'Member'
   */
  private static extractRole(payload: any): string | null {
    console.log('🔍 TokenService: Starting role extraction from payload...');
    console.log('🔍 TokenService: Available payload keys:', Object.keys(payload));
    
    // Define all possible role claim names in order of preference
    const possibleRoleClaims = [
      'role', // Standard claim
      'roles', // Array of roles
      'Role', // Capitalized
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role', // Microsoft schema
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role', // Standard schema
      'custom:role', // Custom namespace
      'user_role', // Alternative naming
      'userRole', // CamelCase
      'memberType', // Your app specific
      'MemberType', // Capitalized app specific
      'authority', // Spring Security
      'authorities' // Spring Security array
    ];
    
    for (const claim of possibleRoleClaims) {
      if (payload.hasOwnProperty(claim) && payload[claim] != null) {
        const roleValue = payload[claim];
        console.log(`🔍 TokenService: Found role claim '${claim}':`, roleValue);
        
        // Handle if roles is an array (take first role or find admin)
        if (Array.isArray(roleValue)) {
          console.log(`🔍 TokenService: Role claim '${claim}' is array:`, roleValue);
          
          // Look for admin roles first
          const adminRoles = ['Administrator', 'Admin', 'ManagementStaff'];
          const foundAdminRole = roleValue.find(role => 
            adminRoles.some(adminRole => 
              role.toString().toLowerCase().includes(adminRole.toLowerCase())
            )
          );
          
          if (foundAdminRole) {
            console.log(`✅ TokenService: Found admin role in array:`, foundAdminRole);
            return foundAdminRole.toString();
          }
          
          // Otherwise take the first non-empty role
          const firstRole = roleValue.find(role => role && role.toString().trim());
          if (firstRole) {
            console.log(`✅ TokenService: Using first role from array:`, firstRole);
            return firstRole.toString();
          }
        } else if (typeof roleValue === 'string' && roleValue.trim()) {
          console.log(`✅ TokenService: Found string role:`, roleValue);
          return roleValue.trim();
        } else if (roleValue != null) {
          // Convert to string if it's a number or other type
          const stringRole = roleValue.toString().trim();
          if (stringRole) {
            console.log(`✅ TokenService: Converted role to string:`, stringRole);
            return stringRole;
          }
        }
      }
    }
    
    console.error('❌ TokenService: No valid role found in token claims!');
    console.error('❌ TokenService: Full payload for debugging:', JSON.stringify(payload, null, 2));
    
    // DON'T RETURN A DEFAULT ROLE - return null to indicate failure
    return null;
  }

  /**
   * FIXED: Enhanced name extraction with better fallback logic
   */
  private static extractName(payload: any): string {
    console.log('🔍 TokenService: Extracting name from payload...');
    
    // 1. Try fullName if it exists and is not just email
    if (payload.fullName && payload.fullName !== payload.email && payload.fullName.trim()) {
      console.log('✅ TokenService: Using fullName:', payload.fullName);
      return payload.fullName.trim();
    }
    
    // 2. Build from Microsoft JWT claims (your backend seems to use these)
    const givenName = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || payload.given_name;
    const surname = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || payload.family_name;
    
    if (givenName && surname) {
      const fullName = `${givenName} ${surname}`.trim();
      console.log('✅ TokenService: Built name from JWT claims:', fullName);
      return fullName;
    }
    
    // 3. Try individual name fields
    if (givenName && givenName.trim()) {
      console.log('✅ TokenService: Using given name only:', givenName);
      return givenName.trim();
    }
    
    // 4. Try standard name claim (but not if it's just the email)
    const standardName = payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    if (standardName && standardName !== payload.email && standardName.trim()) {
      console.log('✅ TokenService: Using standard name claim:', standardName);
      return standardName.trim();
    }
    
    // 5. Build from firstName/lastName if available
    const firstName = payload.firstName || payload.first_name;
    const lastName = payload.lastName || payload.last_name;
    if (firstName && lastName) {
      const fullName = `${firstName} ${lastName}`.trim();
      console.log('✅ TokenService: Built name from firstName/lastName:', fullName);
      return fullName;
    }
    
    // 6. Try unique_name if it's not an email
    if (payload.unique_name && !payload.unique_name.includes('@')) {
      console.log('✅ TokenService: Using unique_name:', payload.unique_name);
      return payload.unique_name.trim();
    }
    
    // 7. Fallback to email username part
    if (payload.email && payload.email.includes('@')) {
      const emailName = payload.email.split('@')[0];
      console.log('⚠️ TokenService: Using email username as fallback:', emailName);
      return emailName;
    }
    
    console.log('⚠️ TokenService: No name found, using fallback');
    return 'Unknown User';
  }

  /**
   * FIXED: Decode JWT token with better error handling and role validation
   */
  static decodeToken(token: string): DecodedToken | null {
    try {
      console.log('🔍 TokenService: Starting token decode process...');
      
      // Validate token format first
      if (!token || typeof token !== 'string') {
        console.error('❌ TokenService: Invalid token - not a string:', typeof token);
        return null;
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('❌ TokenService: Invalid token format - expected 3 parts, got:', parts.length);
        return null;
      }

      const base64Url = parts[1];
      if (!base64Url) {
        console.error('❌ TokenService: Invalid token - missing payload section');
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
      console.log('🔍 TokenService: Successfully parsed JWT payload');
      console.log('🔍 TokenService: Payload keys:', Object.keys(payload));
      
      // CRITICAL: Extract role first and validate it exists
      const extractedRole = this.extractRole(payload);
      if (!extractedRole) {
        console.error('❌ TokenService: CRITICAL - No role found in token! Cannot proceed.');
        console.error('❌ TokenService: This will cause role to default to Member');
        console.error('❌ TokenService: Full payload:', JSON.stringify(payload, null, 2));
        
        // Instead of returning null, let's try one more fallback approach
        // Check if there's any role-like data we can salvage
        const possibleRoleFields = Object.keys(payload).filter(key => 
          key.toLowerCase().includes('role') || 
          key.toLowerCase().includes('type') ||
          key.toLowerCase().includes('auth')
        );
        
        if (possibleRoleFields.length > 0) {
          console.log('🔍 TokenService: Found possible role fields:', possibleRoleFields);
          for (const field of possibleRoleFields) {
            const value = payload[field];
            if (value && typeof value === 'string' && value.trim()) {
              console.log(`⚠️ TokenService: Using fallback role from ${field}:`, value);
              break;
            }
          }
        }
        
        // If we still can't find a role, return null to force re-authentication
        return null;
      }

      // Enhanced user ID extraction
      const extractUserId = (): number => {
        const possibleIdClaims = [
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
          'sub',
          'userId', 
          'id',
          'nameid',
          'user_id'
        ];
        
        for (const claim of possibleIdClaims) {
          if (payload[claim]) {
            const id = parseInt(payload[claim]);
            if (!isNaN(id) && id > 0) {
              console.log(`✅ TokenService: Found user ID in ${claim}:`, id);
              return id;
            }
          }
        }
        
        console.warn('⚠️ TokenService: No valid user ID found, defaulting to 0');
        return 0;
      };

      // Enhanced email extraction
      const extractEmail = (): string => {
        const possibleEmailClaims = [
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          'email',
          'unique_name',
          'upn'
        ];
        
        for (const claim of possibleEmailClaims) {
          if (payload[claim] && typeof payload[claim] === 'string' && payload[claim].includes('@')) {
            console.log(`✅ TokenService: Found email in ${claim}:`, payload[claim]);
            return payload[claim];
          }
        }
        
        console.warn('⚠️ TokenService: No valid email found');
        return '';
      };

      const extractedName = this.extractName(payload);
      const extractedUserId = extractUserId();
      const extractedEmail = extractEmail();

      // Build the decoded token object
      const decoded: DecodedToken = {
        userId: extractedUserId,
        email: extractedEmail,
        name: extractedName,
        role: extractedRole, // This is guaranteed to be valid now
        exp: payload.exp || 0,
        iat: payload.iat || Math.floor(Date.now() / 1000),
        
        // Store additional fields for debugging
        given_name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || payload.given_name,
        family_name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname'] || payload.family_name,
        fullName: extractedName,
        sub: payload.sub,
        nameid: payload.nameid,
        unique_name: payload.unique_name,
        ...payload // Include all other claims
      };
      
      console.log('✅ TokenService: Successfully decoded token');
      console.log('✅ TokenService: Final user info:', {
        userId: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      });
      
      // Final validation
      if (!decoded.role || decoded.role.trim() === '') {
        console.error('❌ TokenService: CRITICAL - Final role is empty after extraction!');
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('❌ TokenService: Failed to decode token:', error);
      console.log('❌ TokenService: Problematic token preview:', token?.substring(0, 100));
      return null;
    }
  }

  /**
   * Get current user from token with better error handling
   */
  static getCurrentUser(): DecodedToken | null {
    try {
      const token = this.getAccessToken();
      if (!token) {
        console.log('TokenService: No access token available');
        return null;
      }

      const decoded = this.decodeToken(token);
      if (!decoded) {
        console.error('TokenService: Failed to decode token - clearing invalid token');
        this.clearTokens(); // Clear invalid token
        return null;
      }

      if (!decoded.role || decoded.role.trim() === '') {
        console.error('TokenService: Token has no valid role - clearing token');
        this.clearTokens(); // Clear token without valid role
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('TokenService: Failed to get current user:', error);
      this.clearTokens(); // Clear potentially corrupted data
      return null;
    }
  }

  /**
   * Check if user is authenticated with role validation
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

      // Try to decode and validate the token has a role
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.role || decoded.role.trim() === '') {
        console.log('TokenService: Token is invalid or has no role');
        this.clearTokens(); // Clear invalid token
        return false;
      }

      console.log('TokenService: User is authenticated with role:', decoded.role);
      return true;
    } catch (error) {
      console.error('TokenService: Failed to check authentication:', error);
      this.clearTokens(); // Clear potentially corrupted data
      return false;
    }
  }

  /**
   * Check if we need token refresh (simple version)
   */
  static needsTokenRefresh(): boolean {
    // For now, we don't have token refresh, so return false
    return false;
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
      
      // Try to decode for additional info
      let decodedInfo = null;
      try {
        const decoded = this.decodeToken(token);
        if (decoded) {
          decodedInfo = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            name: decoded.name,
            exp: decoded.exp
          };
        }
      } catch (e) {
        // Ignore decode errors in info function
      }

      return {
        hasToken: true,
        tokenLength: token.length,
        tokenType,
        isJWT: parts.length === 3,
        parts: parts.length,
        expiresAt: expiresAt ? new Date(parseInt(expiresAt, 10)).toISOString() : null,
        preview: token.substring(0, 20) + '...',
        decoded: decodedInfo
      };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }
}