/**
 * Comprehensive password validation and security utilities
 * Implements industry-standard password policies to prevent common attacks
 */

// Common weak passwords list (basic - in production, use a more comprehensive list)
const COMMON_PASSWORDS = [
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
  'iloveyou', 'princess', 'dragon', 'football', 'sunshine', 'master',
  'shadow', 'trustno1', 'jordan', 'jennifer', 'hunter', 'charlie',
  'andrew', 'andrea', 'joshua', 'daniel', 'anthony', 'michelle'
];

// Password breach list patterns (simplified)
const BREACH_PATTERNS = [
  /password\d+/i,
  /\d{4,}/,  // consecutive numbers
  /qwerty/i,
  /admin/i,
  /login/i,
  /welcome/i
];

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  blockCommonPasswords: boolean;
  blockUserInfo: boolean;
  preventReuse: boolean;
  maxRepeatingChars: number;
  minUniqueChars: number;
}

export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  blockCommonPasswords: true,
  blockUserInfo: true,
  preventReuse: true,
  maxRepeatingChars: 3,
  minUniqueChars: 8
};

export function validatePassword(
  password: string,
  userInfo?: { email?: string; firstName?: string; lastName?: string; phone?: string },
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): PasswordValidationResult {
  const result: PasswordValidationResult = {
    isValid: false,
    score: 0,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Basic length validation
  if (password.length < policy.minLength) {
    result.errors.push(`Password must be at least ${policy.minLength} characters long`);
  }

  if (password.length > policy.maxLength) {
    result.errors.push(`Password must not exceed ${policy.maxLength} characters`);
  }

  // Character requirements
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (policy.requireUppercase && !hasUppercase) {
    result.errors.push('Password must contain at least one uppercase letter');
  }

  if (policy.requireLowercase && !hasLowercase) {
    result.errors.push('Password must contain at least one lowercase letter');
  }

  if (policy.requireNumbers && !hasNumbers) {
    result.errors.push('Password must contain at least one number');
  }

  if (policy.requireSpecialChars && !hasSpecialChars) {
    result.errors.push('Password must contain at least one special character');
  }

  // Check for common passwords
  if (policy.blockCommonPasswords) {
    const lowerPassword = password.toLowerCase();
    if (COMMON_PASSWORDS.includes(lowerPassword)) {
      result.errors.push('Password is too common and easily guessable');
    }

    // Check breach patterns
    for (const pattern of BREACH_PATTERNS) {
      if (pattern.test(password)) {
        result.errors.push('Password matches a known compromised pattern');
        break;
      }
    }
  }

  // Check against user information
  if (policy.blockUserInfo && userInfo) {
    const userInfoValues = [
      userInfo.email?.split('@')[0],
      userInfo.firstName,
      userInfo.lastName,
      userInfo.phone
    ].filter(Boolean).map(v => v!.toLowerCase());

    for (const info of userInfoValues) {
      if (info.length >= 3 && password.toLowerCase().includes(info)) {
        result.errors.push('Password must not contain personal information');
        break;
      }
    }
  }

  // Check for repeating characters
  if (policy.maxRepeatingChars > 0) {
    const repeatingPattern = new RegExp(`(.)\\1{${policy.maxRepeatingChars},}`, 'i');
    if (repeatingPattern.test(password)) {
      result.errors.push(`Password must not have more than ${policy.maxRepeatingChars} consecutive identical characters`);
    }
  }

  // Check unique character count
  const uniqueChars = new Set(password.toLowerCase()).size;
  if (uniqueChars < policy.minUniqueChars) {
    result.errors.push(`Password must contain at least ${policy.minUniqueChars} unique characters`);
  }

  // Calculate password strength score
  result.score = calculatePasswordScore(password, hasUppercase, hasLowercase, hasNumbers, hasSpecialChars);

  // Add score-based warnings and suggestions
  if (result.score < 60) {
    result.warnings.push('Password strength is weak');
    result.suggestions.push('Consider using a longer password with mixed characters');
  } else if (result.score < 80) {
    result.warnings.push('Password strength is moderate');
    result.suggestions.push('Adding more special characters or length would improve security');
  }

  // Check for keyboard patterns
  if (hasKeyboardPattern(password)) {
    result.warnings.push('Password contains keyboard patterns which are easier to guess');
    result.suggestions.push('Avoid sequential keys like "qwerty" or "123456"');
  }

  // Check for dictionary words
  if (hasDictionaryWords(password)) {
    result.warnings.push('Password contains dictionary words');
    result.suggestions.push('Use a passphrase with multiple unrelated words or add numbers/symbols');
  }

  result.isValid = result.errors.length === 0;

  return result;
}

function calculatePasswordScore(
  password: string,
  hasUppercase: boolean,
  hasLowercase: boolean,
  hasNumbers: boolean,
  hasSpecialChars: boolean
): number {
  let score = 0;

  // Length scoring
  score += Math.min(password.length * 4, 50);

  // Character variety
  if (hasUppercase) score += 10;
  if (hasLowercase) score += 10;
  if (hasNumbers) score += 10;
  if (hasSpecialChars) score += 15;

  // Bonus for mixed case
  if (hasUppercase && hasLowercase) score += 5;

  // Unique character bonus
  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars * 2, 15);

  return Math.min(score, 100);
}

function hasKeyboardPattern(password: string): boolean {
  const keyboardPatterns = [
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    '1234567890', 'qwerty', 'asdf', 'zxcv'
  ];

  const lowerPassword = password.toLowerCase();
  return keyboardPatterns.some(pattern =>
    lowerPassword.includes(pattern) ||
    lowerPassword.includes(pattern.split('').reverse().join(''))
  );
}

function hasDictionaryWords(password: string): boolean {
  // Simple dictionary check - in production, use a comprehensive dictionary
  const commonWords = [
    'password', 'login', 'admin', 'user', 'account', 'secure', 'system',
    'welcome', 'company', 'business', 'office', 'computer', 'internet'
  ];

  const lowerPassword = password.toLowerCase();
  return commonWords.some(word => lowerPassword.includes(word));
}

// Password history validation (to prevent reuse)
export async function validatePasswordHistory(
  userId: string,
  newPassword: string,
  previousPasswords: string[]
): Promise<boolean> {
  // In a real implementation, this would hash and compare
  // For now, we'll assume hashed comparison
  return !previousPasswords.includes(newPassword);
}

// Generate password suggestions
export function generatePasswordSuggestions(): string[] {
  return [
    'Use a passphrase with 4+ unrelated words: "Coffee Mountain Blue Sky23!"',
    'Combine a memorable phrase with numbers and symbols: "ILove2Code!2024"',
    'Use the first letters of a sentence: "MyDogIs5YearsOldIn2024!" → "MDI5YOI2024!"',
    'Create an acronym from a book or song title with substitutions'
  ];
}

// Password strength meter labels
export function getPasswordStrengthLabel(score: number): string {
  if (score < 30) return 'Very Weak';
  if (score < 50) return 'Weak';
  if (score < 70) return 'Fair';
  if (score < 85) return 'Good';
  return 'Strong';
}

// Password strength color coding
export function getPasswordStrengthColor(score: number): string {
  if (score < 30) return '#ff4444';
  if (score < 50) return '#ff8800';
  if (score < 70) return '#ffaa00';
  if (score < 85) return '#88aa00';
  return '#00aa44';
}