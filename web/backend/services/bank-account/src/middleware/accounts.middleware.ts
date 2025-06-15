import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import * as AccountsError from '../errors/index';
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
        
        throw new AccountsError.ValidationError('Validation failed', formattedErrors);
      }

      throw new AccountsError.GenericError('Invalid request body');
    }
  };
}