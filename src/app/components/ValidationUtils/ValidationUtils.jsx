'use client';

export const validatePassword = (password) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
  };

  const missing = [];
  if (!requirements.length) missing.push('at least 8 characters');
  if (!requirements.uppercase) missing.push('an uppercase letter');
  if (!requirements.lowercase) missing.push('a lowercase letter');

  return {
    isValid: Object.values(requirements).every(Boolean),
    missing,
    strength: missing.length === 0 ? 'strong' : missing.length === 1 ? 'moderate' : 'weak'
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    message: emailRegex.test(email) ? '' : 'Please enter a valid email address'
  };
};