import React from 'react';

const ValidationMessage = ({ 
  type = "error", 
  message, 
  show = false, 
  className = "" 
}) => {
  if (!show || !message) return null;

  const baseClasses = "p-3 rounded-lg border text-sm font-medium";
  
  const typeClasses = {
    error: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    success: "bg-green-50 border-green-200 text-green-700",
    info: "bg-blue-50 border-blue-200 text-blue-700"
  };

  const icons = {
    error: "❌",
    warning: "⚠️",
    success: "✅",
    info: "ℹ️"
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      <div className="flex items-center">
        <span className="mr-2">{icons[type]}</span>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default ValidationMessage; 