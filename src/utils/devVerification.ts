import { AuthenticationService } from "@/domain/services/Auth/AuthenticationService";
import { AuthApiService } from "@/infrastructure/api/AuthApiService";
import { TokenService } from "@/infrastructure/services/TokenService";
import { Container } from "@/shared/container/Container";

export class DevVerification {
  static async verifySetup() {
    console.group('Development Setup Verification');
    
    try {
      // Check environment
      console.log('📋 Environment:', {
        NODE_ENV: import.meta.env.NODE_ENV,
        API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        DEV: import.meta.env.DEV
      });

      // Check if classes are available
      const checks = {
        'Container': typeof Container !== 'undefined',
        'TokenService': typeof TokenService !== 'undefined',
        'AuthApiService': typeof AuthApiService !== 'undefined',
        'AuthenticationService': typeof AuthenticationService !== 'undefined',
      };

      console.log('📦 Class Availability:', checks);

      // Check localStorage
      const storage = {
        hasAccessToken: !!localStorage.getItem('library_access_token'),
        hasRefreshToken: !!localStorage.getItem('library_refresh_token'),
        hasTokenType: !!localStorage.getItem('library_token_type'),
        hasExpiresAt: !!localStorage.getItem('library_expires_at'),
      };

      console.log('Storage Status:', storage);

      // Test API connectivity
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://localhost:7033'}/api/health`);
        console.log('API Connectivity:', response.ok ? 'Connected' : 'Not reachable');
      } catch (error) {
        console.log('API Connectivity:', 'Connection failed', error);
      }

      console.log('Verification complete');
      
    } catch (error) {
      console.error('Verification failed:', error);
    }
    
    console.groupEnd();
  }

  static clearAllData() {
    console.log('Clearing all application data...');
    
    // Clear localStorage
    const keys = ['library_access_token', 'library_refresh_token', 'library_token_type', 'library_expires_at'];
    keys.forEach(key => localStorage.removeItem(key));
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    console.log('All data cleared');
    console.log('Refreshing page...');
    window.location.reload();
  }

  static testLogin() {
    console.log('Testing login with demo credentials...');
    
    // This would simulate the login process
    const testCredentials = {
      email: 'admin@library.com',
      password: 'admin123'
    };
    
    console.log('Test credentials:', testCredentials);
    console.log('Use these credentials in the login form to test');
  }
}

// Make available globally in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).devVerify = DevVerification;
  console.log('Development verification tools available at window.devVerify');
  console.log('Available methods:');
  console.log('  • window.devVerify.verifySetup() - Check if everything is configured');
  console.log('  • window.devVerify.clearAllData() - Clear all stored data');
  console.log('  • window.devVerify.testLogin() - Show test credentials');
}