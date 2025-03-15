
import { useState, useEffect } from 'react';

// Custom hook for form validation
export const useFormValidation = (agreeToTerms: boolean) => {
  const [termsError, setTermsError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailAttempts, setEmailAttempts] = useState(0);
  
  // Clear terms error when checkbox is checked
  useEffect(() => {
    if (agreeToTerms) {
      setTermsError('');
    }
  }, [agreeToTerms]);
  
  return {
    termsError,
    setTermsError,
    emailError,
    setEmailError,
    emailAttempts,
    setEmailAttempts
  };
};

// Helper for parsing names
export const parseFullName = (name: string) => {
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    firstName,
    lastName,
    fullName: name.trim()
  };
};
