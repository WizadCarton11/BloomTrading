/**
 * Utility functions for authentication service
 */

/**
 * Sanitizes user data for API responses by removing sensitive information
 */
export function sanitizeUserData(user: any) {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * Generates a random string for tokens
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Masks sensitive data for logging
 */
export function maskSensitiveData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const masked = { ...data };
  const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken'];
  
  for (const field of sensitiveFields) {
    if (masked[field]) {
      masked[field] = '***masked***';
    }
  }
  
  return masked;
}

/**
 * Converts null values to undefined for consistent API responses
 */
export function nullToUndefined<T>(obj: T): T {
  if (obj === null) {
    return undefined as unknown as T;
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const result = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      (result as any)[key] = nullToUndefined(value);
    }
    return result;
  }
  
  return obj;
}
