// Validation utilities for form inputs

export const validateMessage = (message) => {
  const errors = [];

  if (!message || !message.trim()) {
    errors.push("Message cannot be empty");
  }

  if (message && message.length > 10000) {
    errors.push("Message is too long (maximum 10,000 characters)");
  }

  // Note: We removed suspicious pattern validation because:
  // 1. The system should analyze ANY message - that's the whole point
  // 2. The AI will determine if content is malicious, not pre-validation
  // 3. Users should be able to analyze messages containing any words

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    error: emailRegex.test(email) ? null : "Please enter a valid email address"
  };
};

export const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous HTML
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .trim();
}; 