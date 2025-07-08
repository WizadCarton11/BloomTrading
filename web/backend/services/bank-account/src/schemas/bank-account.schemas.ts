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
export const registerSchema = z.object({
  email: emailSchema,
  password: stringSchema,
  firstName: nameSchema,
  lastName: nameSchema.optional()
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Password is required' })
});

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .min(1, { message: 'Refresh token is required' })
    .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, {
      message: 'Invalid refresh token format'
    })
});
export const createAccountSchema = z.object({
  userId: uuidSchema
  .optional() 
  ,
  currency: z
    .string()
    .min(3, { message: 'Currency code must be at least 3 characters long' })
    .max(3, { message: 'Currency code cannot exceed 3 characters' })
    .regex(/^[A-Z]{3}$/, {
      message: 'Currency code must be a valid 3-letter ISO currency code'
    })
    .default('INR')
});

//#endregion

// Authorization header validation
export const authHeaderSchema = z
  .string()
  .regex(/^Bearer\s+[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/, {
    message: 'Invalid authorization header format'
  });
export const buyStockSchema = z.object({
  transactionId: uuidSchema,
  stockSymbol: stringSchema,
  // amount is decimal, can be 0
  amount: z
    .number()
    .min(0, { message: 'Amount must be a non-negative number' })
    .default(0),
  numberOfShares: numberSchema.optional().default(1),
  // average price is decimal, can be 0
  averagePrice: z
    .number()
    .min(0, { message: 'Average price must be a non-negative number' })
}).strict().refine(data => data.amount > 0, {
  message: 'Amount must be greater than zero'
});
// Export types derived from schemas
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type CreateAccountRequest = z.infer<typeof createAccountSchema>;
export type AuthHeader = z.infer<typeof authHeaderSchema>;
export type BuyStockRequest = z.infer<typeof buyStockSchema>;