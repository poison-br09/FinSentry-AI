import React from 'react';

const DebugPanel = ({ sessionData, processingStatus, sessionId, sessionResults }) => {
  return (
    <div style={{ 
      marginTop: '2rem', 
      padding: '1rem', 
      backgroundColor: '#f5f5f5', 
      borderRadius: '5px',
      border: '1px solid #ddd'
    }}>
      <h3>🔍 Debug Information</h3>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Session ID:</strong> {sessionId || 'None'}
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Processing Status:</strong>
        <pre style={{ fontSize: '12px', marginTop: '0.5rem' }}>
          {JSON.stringify(processingStatus, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Session Results:</strong>
        <pre style={{ fontSize: '12px', marginTop: '0.5rem' }}>
          {JSON.stringify(sessionResults, null, 2)}
        </pre>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <strong>Dashboard Session Data:</strong>
        <pre style={{ fontSize: '12px', marginTop: '0.5rem' }}>
          {JSON.stringify(sessionData, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugPanel; 