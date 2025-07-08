import { z } from 'zod';

//#region base schemas
export const stringSchema = z
  .string()
  .min(1, { message: 'This field cannot be empty' })
  .max(255, { message: 'This field cannot exceed 255 characters' })
  .trim();

export const uuidSchema = z
  .string()
  .uuid({ message: 'Invalid UUID format' })
  .min(1, { message: 'UUID is required' })
  .max(36, { message: 'UUID cannot exceed 36 characters' });

export const booleanSchema = z
  .boolean()
  .refine(value => typeof value === 'boolean', {
    message: 'This field must be a boolean value'
  })
  .default(false);

export const numberSchema = z
  .number()
  .int({ message: 'This field must be an integer' })
  .min(0, { message: 'This field must be a non-negative integer' })
  .max(1000000, { message: 'This field cannot exceed 1,000,000' })
  .default(0);

export const dateSchema = z
  .string()
  .refine(value => !isNaN(Date.parse(value)), {
    message: 'Invalid date format'
  })
  .transform(value => new Date(value))
  .refine(date => date instanceof Date && !isNaN(date.getTime()), {
    message: 'Invalid date'
  })
  .or(z.date())
  .default(new Date());

export const emailSchema = z
  .string()
  .email({ message: 'Please enter a valid email address' })
  .min(1, { message: 'Email is required' });

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  });

export const nameSchema = z
  .string()
  .min(1, { message: 'Name cannot be empty' })
  .max(50, { message: 'Name cannot exceed 50 characters' })
  .regex(/^[a-zA-Z\s-']+$/, {
    message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
  });
//#endregion

//#region Request body validation schemas

//#endregion

// Authorization header validation
export const authHeaderSchema = z
  .string()
  .regex(/^Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, {
    message: 'Invalid authorization header format'
  });

// Export types derived from schemas
