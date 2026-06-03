/**
 * Comprehensive input validation and sanitization system
 * Protects against XSS, SQL injection, and other input-based attacks
 */

import DOMPurify from "isomorphic-dompurify";
import validator from "validator";
import { z } from "zod";

// Security-focused validation schemas
export const ValidationSchemas = {
  // Email validation with security checks
  email: z
    .string()
    .min(1, "Email is required")
    .max(254, "Email too long")
    .refine((email) => validator.isEmail(email), "Invalid email format")
    .refine((email) => !email.includes(".."), "Invalid email format")
    .refine((email) => {
      // Prevent email header injection
      const suspiciousPatterns = [/\r/, /\n/, /%0a/i, /%0d/i, /\x00/];
      return !suspiciousPatterns.some(pattern => pattern.test(email));
    }, "Invalid email format"),

  // Password validation (works with password-validation.ts)
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .max(128, "Password too long")
    .refine((password) => {
      // Check for null bytes and other dangerous characters
      return !password.includes('\x00') && !password.includes('\r') && !password.includes('\n');
    }, "Invalid password format"),

  // Name validation (prevents XSS and injection)
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name too long")
    .refine((name) => {
      // Allow only letters, spaces, hyphens, and apostrophes
      return /^[a-zA-Z\s\-']+$/.test(name);
    }, "Name contains invalid characters")
    .transform((name) => DOMPurify.sanitize(name.trim())),

  // Phone number validation
  phone: z
    .string()
    .refine((phone) => {
      // Remove common phone formatting
      const cleaned = phone.replace(/[\s\-\(\)\+\.]/g, '');
      return validator.isMobilePhone(cleaned) || validator.isNumeric(cleaned);
    }, "Invalid phone number format")
    .transform((phone) => phone.replace(/[^\d\+\-\(\)\s]/g, '')),

  // Company/Organization name
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name too long")
    .refine((name) => {
      // Allow alphanumeric, spaces, common business symbols
      return /^[a-zA-Z0-9\s\-\&\.\,\(\)]+$/.test(name);
    }, "Company name contains invalid characters")
    .transform((name) => DOMPurify.sanitize(name.trim())),

  // URL validation
  url: z
    .string()
    .refine((url) => {
      if (!url) return true; // Optional field
      return validator.isURL(url, {
        protocols: ['http', 'https'],
        require_protocol: true,
        require_host: true,
        require_valid_protocol: true,
        allow_underscores: false,
        host_whitelist: undefined,
        host_blacklist: undefined,
        allow_trailing_dot: false,
        allow_protocol_relative_urls: false
      });
    }, "Invalid URL format"),

  // ID validation (UUIDs, database IDs)
  id: z
    .string()
    .refine((id) => validator.isUUID(id) || validator.isAlphanumeric(id, 'en-US', { ignore: '-_' }), "Invalid ID format"),

  // Numeric validation
  positiveNumber: z
    .number()
    .positive("Must be a positive number")
    .finite("Must be a finite number")
    .safe("Number too large"),

  // File upload validation
  filename: z
    .string()
    .max(255, "Filename too long")
    .refine((filename) => {
      // Prevent directory traversal
      return !filename.includes('..') && !filename.includes('/') && !filename.includes('\\');
    }, "Invalid filename")
    .refine((filename) => {
      // Allow only safe characters
      return /^[a-zA-Z0-9\-_\.\s]+$/.test(filename);
    }, "Filename contains invalid characters")
    .transform((filename) => filename.trim()),

  // HTML content (for rich text editors)
  htmlContent: z
    .string()
    .max(50000, "Content too long")
    .transform((html) => {
      // Sanitize HTML to prevent XSS
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        ALLOWED_ATTR: ['class'],
        KEEP_CONTENT: true,
        FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'button'],
        FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur']
      });
    }),

  // Search query validation
  searchQuery: z
    .string()
    .max(200, "Search query too long")
    .refine((query) => {
      // Prevent SQL injection patterns
      const sqlPatterns = [
        /union\s+select/i,
        /drop\s+table/i,
        /delete\s+from/i,
        /insert\s+into/i,
        /update\s+set/i,
        /'.*--/,
        /;\s*drop/i,
        /exec\s*\(/i,
        /script\s*:/i
      ];
      return !sqlPatterns.some(pattern => pattern.test(query));
    }, "Invalid search query")
    .transform((query) => query.trim()),

  // JSON validation
  jsonString: z
    .string()
    .refine((str) => {
      try {
        JSON.parse(str);
        return true;
      } catch {
        return false;
      }
    }, "Invalid JSON format"),

  // IP Address validation
  ipAddress: z
    .string()
    .refine((ip) => validator.isIP(ip), "Invalid IP address"),

  // Date validation
  dateString: z
    .string()
    .refine((date) => validator.isISO8601(date), "Invalid date format"),

  // Role code validation
  roleCode: z
    .string()
    .min(1, "Role code is required")
    .max(50, "Role code too long")
    .refine((code) => /^[a-z_]+$/.test(code), "Role code must be lowercase with underscores only"),

  // Permission validation
  permission: z
    .string()
    .refine((perm) => /^[A-Z_]+$/.test(perm), "Permission must be uppercase with underscores"),
};

/**
 * User registration validation schema
 */
export const UserRegistrationSchema = z.object({
  firstName: ValidationSchemas.name,
  lastName: ValidationSchemas.name,
  email: ValidationSchemas.email,
  phone: ValidationSchemas.phone,
  companyName: ValidationSchemas.companyName,
  companySize: z.enum(['1-10', '11-50', '51-200', '201+', '201-1000', '1000+'], {
    required_error: "Company size is required"
  }),
  industry: z.string().max(100, "Industry too long").optional(),
  country: z.string().max(80, "Country too long").optional(),
  state: z.string().max(80, "State too long").optional(),
  address: z.string().max(500, "Address too long").optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code").optional(),
  timezone: z.string().max(80, "Timezone too long").optional(),
  defaultLocale: z.enum(["en", "fr"]).optional(),
  password: ValidationSchemas.password,
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

/**
 * User login validation schema
 */
export const UserLoginSchema = z.object({
  email: ValidationSchemas.email,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional()
});

/**
 * Role creation validation schema
 */
export const RoleCreationSchema = z.object({
  name: ValidationSchemas.name,
  description: z.string().max(500, "Description too long").optional(),
  permissions: z.array(ValidationSchemas.permission).min(1, "At least one permission is required"),
  organizationId: ValidationSchemas.id
});

/**
 * User update validation schema
 */
export const UserUpdateSchema = z.object({
  firstName: ValidationSchemas.name.optional(),
  lastName: ValidationSchemas.name.optional(),
  phone: ValidationSchemas.phone.optional(),
  jobTitle: z.string().max(100, "Job title too long").optional(),
  isActive: z.boolean().optional()
});

/**
 * Security-focused validation functions
 */
export class SecurityValidator {
  /**
   * Validate and sanitize input against common attack vectors
   */
  static validateInput(input: string, type: 'text' | 'html' | 'sql' | 'json' = 'text'): {
    isValid: boolean;
    sanitized: string;
    errors: string[];
  } {
    const errors: string[] = [];
    let sanitized = input;

    try {
      // Check for null bytes
      if (input.includes('\x00')) {
        errors.push('Input contains null bytes');
      }

      // Check for control characters
      if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(input)) {
        errors.push('Input contains control characters');
      }

      // Type-specific validation
      switch (type) {
        case 'html':
          sanitized = DOMPurify.sanitize(input);
          break;

        case 'sql':
          // Check for SQL injection patterns
          const sqlPatterns = [
            /union\s+select/i,
            /drop\s+table/i,
            /delete\s+from/i,
            /insert\s+into/i,
            /'.*--/,
            /;\s*drop/i,
            /exec\s*\(/i
          ];

          if (sqlPatterns.some(pattern => pattern.test(input))) {
            errors.push('Input contains suspicious SQL patterns');
          }
          break;

        case 'json':
          try {
            JSON.parse(input);
          } catch {
            errors.push('Invalid JSON format');
          }
          break;

        case 'text':
        default:
          // Basic text sanitization
          sanitized = input.replace(/[<>]/g, '');
          break;
      }

      return {
        isValid: errors.length === 0,
        sanitized,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        sanitized: '',
        errors: ['Validation error occurred']
      };
    }
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: {
    name: string;
    size: number;
    type: string;
  }, allowedTypes: string[] = [], maxSize: number = 5 * 1024 * 1024): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate filename
    const filenameValidation = ValidationSchemas.filename.safeParse(file.name);
    if (!filenameValidation.success) {
      errors.push('Invalid filename');
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size too large (max ${maxSize / 1024 / 1024}MB)`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    // Check for dangerous file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.jar', '.vbs', '.js', '.php', '.asp'];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (dangerousExtensions.includes(extension)) {
      errors.push('File type is not allowed for security reasons');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate API request headers
   */
  static validateHeaders(headers: Record<string, string>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for header injection
    for (const [key, value] of Object.entries(headers)) {
      if (value.includes('\r') || value.includes('\n')) {
        errors.push(`Header injection detected in ${key}`);
      }

      if (value.length > 8192) {
        errors.push(`Header ${key} too long`);
      }
    }

    // Validate User-Agent
    if (headers['user-agent'] && headers['user-agent'].length > 1024) {
      errors.push('User-Agent header too long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Rate limit validation for input frequency
   */
  static validateInputRate(
    identifier: string,
    maxRequests: number = 100,
    windowMs: number = 60000
  ): boolean {
    // Implementation would track input frequency per identifier
    // For now, return true (implement with Redis in production)
    return true;
  }
}

/**
 * Middleware validation helper
 */
export function validateRequestBody<T>(
  body: unknown,
  schema: z.ZodSchema<T>
): { success: boolean; data?: T; errors?: string[] } {
  try {
    const result = schema.safeParse(body);

    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
  } catch (error) {
    return { success: false, errors: ['Validation failed'] };
  }
}

/**
 * XSS Prevention utilities
 */
export class XSSPrevention {
  /**
   * Sanitize user input for safe display
   */
  static sanitizeForDisplay(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }

  /**
   * Sanitize HTML content
   */
  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
    }

  /**
   * Escape HTML entities
   */
  static escapeHTML(text: string): string {
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };

    return text.replace(/[&<>"'\/]/g, (char) => entityMap[char]);
  }
}
