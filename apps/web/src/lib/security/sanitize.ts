/**
 * Input Sanitization Utilities
 * Protects against XSS, SQL injection, and other attacks
 */

export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/expression\s*\(/gi, '') // Remove CSS expressions
    .replace(/script/gi, '') // Remove script tags
    .trim()
    .substring(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const clean = email.toLowerCase().trim();
  
  return emailRegex.test(clean) ? clean : '';
}

export function sanitizeNumeric(input: any): number {
  const num = parseFloat(input);
  return isNaN(num) ? 0 : Math.max(0, Math.min(999999, num)); // Reasonable bounds
}

export function sanitizeInteger(input: any): number {
  const num = parseInt(input);
  return isNaN(num) ? 0 : Math.max(0, Math.min(999999, num));
}

export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') return input;
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true';
  }
  return Boolean(input);
}

export function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return {};
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = sanitizeString(key);
    if (!cleanKey) continue;
    
    if (typeof value === 'string') {
      sanitized[cleanKey] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[cleanKey] = sanitizeNumeric(value);
    } else if (typeof value === 'boolean') {
      sanitized[cleanKey] = sanitizeBoolean(value);
    } else if (Array.isArray(value)) {
      sanitized[cleanKey] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      ).slice(0, 100); // Limit array size
    } else if (typeof value === 'object' && value !== null) {
      sanitized[cleanKey] = sanitizeObject(value);
    }
  }
  
  return sanitized;
}

// Aliases for backwards compatibility
export const sanitizeInput = sanitizeString;
export const sanitizeText = sanitizeString;

export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim().toLowerCase());
}

export function validateRequiredFields(obj: any, requiredFields: string[]): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => !obj[field] || (typeof obj[field] === 'string' && !obj[field].trim()));
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

export function validateShippingSettings(settings: any): {
  isValid: boolean;
  errors: string[];
  sanitized: any;
} {
  const errors: string[] = [];
  const sanitized: any = {};
  
  try {
    // Validate and sanitize each field
    if (settings.singleItemShippingCAD !== undefined) {
      const val = sanitizeNumeric(settings.singleItemShippingCAD);
      if (val < 0 || val > 1000) {
        errors.push('Single item shipping CAD must be between 0 and 1000');
      } else {
        sanitized.singleItemShippingCAD = val;
      }
    }
    
    if (settings.singleItemShippingUSD !== undefined) {
      const val = sanitizeNumeric(settings.singleItemShippingUSD);
      if (val < 0 || val > 1000) {
        errors.push('Single item shipping USD must be between 0 and 1000');
      } else {
        sanitized.singleItemShippingUSD = val;
      }
    }
    
    if (settings.combinedShippingCAD !== undefined) {
      const val = sanitizeNumeric(settings.combinedShippingCAD);
      if (val < 0 || val > 1000) {
        errors.push('Combined shipping CAD must be between 0 and 1000');
      } else {
        sanitized.combinedShippingCAD = val;
      }
    }
    
    if (settings.combinedShippingUSD !== undefined) {
      const val = sanitizeNumeric(settings.combinedShippingUSD);
      if (val < 0 || val > 1000) {
        errors.push('Combined shipping USD must be between 0 and 1000');
      } else {
        sanitized.combinedShippingUSD = val;
      }
    }
    
    if (settings.combinedShippingThreshold !== undefined) {
      const val = sanitizeInteger(settings.combinedShippingThreshold);
      if (val < 2 || val > 100) {
        errors.push('Combined shipping threshold must be between 2 and 100');
      } else {
        sanitized.combinedShippingThreshold = val;
      }
    }
    
    // Boolean fields
    ['enableShipping', 'internationalShipping', 'combinedShippingEnabled'].forEach(field => {
      if (settings[field] !== undefined) {
        sanitized[field] = sanitizeBoolean(settings[field]);
      }
    });
    
    // String fields
    ['siteName', 'siteFavicon', 'seoTitle', 'seoDescription', 'seoKeywords', 'seoAuthor'].forEach(field => {
      if (settings[field] !== undefined) {
        sanitized[field] = sanitizeString(settings[field]);
      }
    });
    
  } catch (error) {
    errors.push('Invalid input format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}