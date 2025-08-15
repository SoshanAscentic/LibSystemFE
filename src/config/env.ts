export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7033',
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  IS_PRODUCTION: import.meta.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: import.meta.env.NODE_ENV === 'development',
} as const;
