import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as grpcClient from '../grpc-client';
import * as StockErrors from '../errors/index';
import { access } from 'fs';
import i18next from 'i18next';

interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  accessToken?: string;
}

// Auth middleware
async function authenticate(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const refreshtoken= request.headers['x-refresh-token'] as string;
    const lang= request.headers['x-lang'] || 'en';
    const t = i18next.getFixedT(lang);
    if (!token) {
      throw new StockErrors.UnauthorizedError('No authorization token provided');
    }

    const validation = await grpcClient.validateToken(token, refreshtoken);
    if (!validation.valid) {
      console.error(validation.error);
      if (validation.error?.toLowerCase() === 'jwt expired') {
        throw new StockErrors.TokenExpiredError('Token has expired');
      }
      if (validation.error?.toLowerCase() === 'jwt malformed') {
        throw new StockErrors.ValidationError('Malformed token');
      }
      if (validation.error?.toLowerCase() === 'invalid or expired refresh token'){
        throw new StockErrors.InvalidRefreshTokenError('Invalid or expired refresh token');
      }
      throw new StockErrors.ValidationError('Invalid token');
    }

    request.userId = validation.user_id;
    request.accessToken = validation.accessToken;
  } catch (error: any) {
    throw error;
  }
}

async function stockRoutes(fastify: FastifyInstance): Promise<void> {

   fastify.post<{ Body: any }>('/test', {
    preHandler: [authenticate], 

  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const lang = request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      return reply.send({ message: t('test.success') });
    } catch (error: any) {
      console.error(error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      return {
        message: t(error.metadata.langKey || 'account.create.error'),
        error: error.message || 'An error occurred during registration',
        statusCode: error.statusCode || 500,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        details: error.details || null
      } as any;
    }
  });
  
}

export = stockRoutes;