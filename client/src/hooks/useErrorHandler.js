import { useState, useCallback } from 'react';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error, context = '') => {
    console.error(`🚨 Error in ${context}:`, error);
    
    // Set error state
    setError({
      message: error.message || 'An unexpected error occurred',
      context,
      timestamp: new Date().toISOString(),
      originalError: error
    });

    // You can also send to error reporting service here
    // Example: logErrorToService(error, context);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: !!error
  };
};

// Helper function to wrap async operations
export const withErrorHandler = (asyncFunction) => {
  return async (...args) => {
    try {
      return await asyncFunction(...args);
    } catch (error) {
      console.error('🚨 Async operation failed:', error);
      throw error; // Re-throw so calling code can handle it
    }
  };
}; 