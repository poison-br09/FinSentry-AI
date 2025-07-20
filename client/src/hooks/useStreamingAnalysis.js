import { useState, useCallback } from 'react';

export const useStreamingAnalysis = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const analyzeFile = useCallback(async (file) => {
    setIsProcessing(true);
    setProgress('');
    setResult(null);
    setError(null);
    setSessionId(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-stream', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'status':
                  setProgress(data.message);
                  if (data.session_id) {
                    setSessionId(data.session_id);
                  }
                  break;
                  
                case 'result':
                  setResult(data.data);
                  break;
                  
                case 'error':
                  setError(data.message);
                  break;
                  
                case 'complete':
                  setIsProcessing(false);
                  return;
                  
                default:
                  console.warn('Unknown streaming data type:', data.type);
                  break;
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming data:', parseError);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress('');
    setResult(null);
    setError(null);
    setSessionId(null);
  }, []);

  return {
    analyzeFile,
    isProcessing,
    progress,
    result,
    error,
    sessionId,
    reset
  };
}; 