// Centralized validation utilities
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*)?$/;
export const LINKEDIN_REGEX = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in\/|company\/)[a-zA-Z0-9-]+\/?$/;
export const PHONE_REGEX = /^\+?[\d\s\-\(\)]+$/;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  return { isValid: true };
};

export const validateUrl = (url: string): ValidationResult => {
  if (!url.trim()) {
    return { isValid: true }; // URL is optional
  }
  
  // Add https:// prefix if missing
  const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
  
  if (!URL_REGEX.test(url)) {
    return { isValid: false, error: 'Invalid URL format. Example: www.example.com' };
  }
  return { isValid: true };
};

export const validateLinkedIn = (url: string): ValidationResult => {
  if (!url.trim()) {
    return { isValid: true }; // LinkedIn URL is optional
  }
  
  // Add https:// prefix if missing
  const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
  
  if (!LINKEDIN_REGEX.test(urlWithProtocol)) {
    return { isValid: false, error: 'Invalid LinkedIn URL. Example: www.linkedin.com/company/example' };
  }
  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  return { isValid: true };
};