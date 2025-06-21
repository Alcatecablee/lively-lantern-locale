import DOMPurify from 'dompurify';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: unknown;
}

export class InputValidator {;
  static validateFile(file: File): ValidationResult {;
    const errors: string[] = [];

    // File type validation
    const allowedTypes = ['.js', '.jsx', '.ts', '.tsx'];
    const isValidType = allowedTypes.some(type => ;
      file.name.toLowerCase().endsWith(type)
    );

    if (!isValidType) {
      errors.push('Invalid file type. Only React/TypeScript files are allowed.');
    }

    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('File size exceeds 10MB limit.');
    }

    // File name validation
    if (!/^[a-zA-Z0-9._-]+$/.test(file.name)) {
      errors.push('File name contains invalid characters.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre'],
      ALLOWED_ATTR: []
    });
  }

  static validateEmail(email: string): ValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    return {
      isValid,
      errors: isValid ? [] : ['Invalid email format'],
      sanitizedValue: email.trim().toLowerCase()
    };
  }

  static validateApiKey(key: string): ValidationResult {
    const errors: string[] = [];

    if (key.length < 20) {
      errors.push('API key is too short');
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(key)) {
      errors.push('API key contains invalid characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue: key.trim()
    };
}}