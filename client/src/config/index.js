// Environment configuration
export const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
  IS_DEVELOPMENT: process.env.REACT_APP_ENVIRONMENT === 'development',
  IS_PRODUCTION: process.env.REACT_APP_ENVIRONMENT === 'production',
};

// Helper function to get API URL
export const getApiUrl = (endpoint = '') => {
  return `${config.API_BASE_URL}${endpoint}`;
};

// Helper function to check if we're in development
export const isDevelopment = () => config.IS_DEVELOPMENT;

// Helper function to check if we're in production
export const isProduction = () => config.IS_PRODUCTION; 