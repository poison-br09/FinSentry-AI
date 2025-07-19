import { useState, useCallback } from 'react';

export const useRetry = (maxRetries = 3, delay = 1000) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = useCallback(async (operation) => {
    setIsRetrying(true);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setRetryCount(attempt);
        const result = await operation();
        setIsRetrying(false);
        setRetryCount(0);
        return result;
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
        console.log(`Attempt ${attempt} failed:`, error);
      }
        
        if (attempt === maxRetries) {
          setIsRetrying(false);
          setRetryCount(0);
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }, [maxRetries, delay]);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retry,
    retryCount,
    isRetrying,
    resetRetry,
    hasRetriesLeft: retryCount < maxRetries
  };
}; 