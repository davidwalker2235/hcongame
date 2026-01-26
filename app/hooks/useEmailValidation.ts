'use client';

import { useState, useCallback } from 'react';

export const useEmailValidation = () => {
  const [error, setError] = useState<string>('');

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    if (email && !isValid) {
      setError('Invalid email format');
      return false;
    }
    
    setError('');
    return true;
  }, []);

  const handleEmailChange = useCallback((value: string, onChange: (value: string) => void) => {
    onChange(value);
    validateEmail(value);
  }, [validateEmail]);

  return {
    error,
    validateEmail,
    handleEmailChange,
    setError,
  };
};
