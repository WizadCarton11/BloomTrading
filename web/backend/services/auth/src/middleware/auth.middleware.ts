import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { authHeaderSchema } from '../schemas/auth.schemas';
import * as authService from '../services/auth-service';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Validates request body against a Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const validatedData = schema.parse(request.body);
      // Replace the body with validated data
      request.body = validatedData;
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return reply.code(400).send({
          error: 'Validation failed',
          details: formattedErrors
        });
      }
      
      return reply.code(400).send({
        error: 'Invalid request body'
      });
    }
  };
}

/**
 * Validates and extracts user from Authorization header
 */
export async function authenticateToken(request: FastifyRequest & Partial<AuthenticatedRequest>, reply: FastifyReply) {
  try {

    
    const authAccessToken = request.cookies['accessToken'] || request.headers.authorization;
    const authRefreshToken = request.cookies['refreshToken'] || request.headers['x-refresh-token'];
    if (!authAccessToken) {
        const validation = await authService.validateToken("", authRefreshToken);
        if (!validation.valid) {
          return reply.code(401).send({ error: 'Invalid token' });
        }
        request.userId = validation.user_id;
        request.accessToken = validation.accessToken;
        
        return;
    }

    // Validate header format
    const validatedHeader = authHeaderSchema.parse(authAccessToken);
    const token = validatedHeader.replace('Bearer ', '');

    const validation = await authService.validateToken(token, authRefreshToken);
    if (!validation.valid) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    request.userId = validation.user_id;
  } catch (error: any) {
    if (error instanceof ZodError) {
      return reply.code(401).send({ error: 'Invalid authorization header format' });
    }
    
    return reply.code(401).send({ error: 'Token validation failed' });
  }
}

/**
 * Generic error handler for auth routes
 */
export function handleAuthError(error: any, reply: FastifyReply) {
  console.error('Auth error:', error);
  
  if (error.code === 'P2002') { // Prisma unique constraint error
    return reply.code(409).send({ error: 'Email already exists' });
  }
  
  if (error.message?.includes('Invalid credentials')) {
    return reply.code(401).send({ error: 'Invalid email or password' });
  }
  
  if (error.message?.includes('User not found')) {
    return reply.code(404).send({ error: 'User not found' });
  }
  
  if (error.message?.includes('Token expired')) {
    return reply.code(401).send({ error: 'Token expired' });
  }
  
  // Default error response
  return reply.code(500).send({ error: 'Internal server error' });
}
