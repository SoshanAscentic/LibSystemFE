import React from 'react';
import { AuthDebugTools } from '../utils/authDebug';

export const AuthFixer: React.FC = () => {
  React.useEffect(() => {
    // Auto-fix invalid tokens on mount
    const fixed = AuthDebugTools.checkAndFixInvalidTokens();
    if (fixed) {
      console.log('🔧 Auto-fixed invalid tokens');
    }
  }, []);

  return null;
};