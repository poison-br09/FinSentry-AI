import React, { useState } from 'react';

const ErrorTest = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error('This is a test error to verify error boundary functionality!');
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-yellow-800 mb-2">Error Boundary Test</h3>
      <p className="text-yellow-700 mb-3">
        Click the button below to test the error boundary functionality.
      </p>
      <button
        onClick={() => setShouldThrow(true)}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
      >
        Trigger Test Error
      </button>
    </div>
  );
};

export default ErrorTest; 