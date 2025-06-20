import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as accountService from '../services/account-service';
import * as grpcClient from '../grpc-client';
import { CreateAccountBody, AccountParams, TransferBody, TransactionQuery, CreateTransactionBody } from '../types';
import * as AccountErrors from '../errors/index';
import { access } from 'fs';
import { validateBody } from '../middleware/accounts.middleware';
import { CreateAccountRequest, createAccountSchema } from '../schemas';
import i18next from 'i18next';
import { cacheWithRevalidation } from '../utils/cahce_with_revalidation';

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
      throw new AccountErrors.UnauthorizedError('No authorization token provided');
    }

    const validation = await grpcClient.validateToken(token, refreshtoken);
    if (!validation.valid) {
      console.error(validation.error);
      if (validation.error?.toLowerCase() === 'jwt expired') {
        throw new AccountErrors.TokenExpiredError('Token has expired');
      }
      if (validation.error?.toLowerCase() === 'jwt malformed') {
        throw new AccountErrors.ValidationError('Malformed token');
      }
      if (validation.error?.toLowerCase() === 'invalid or expired refresh token'){
        throw new AccountErrors.InvalidRefreshTokenError('Invalid or expired refresh token');
      }
      throw new AccountErrors.ValidationError('Invalid token');
    }

    request.userId = validation.user_id;
    request.accessToken = validation.accessToken;
  } catch (error: any) {
    throw error;
  }
}

async function accountRoutes(fastify: FastifyInstance): Promise<void> {
  // Create account
  fastify.post<{ Body: CreateAccountRequest }>('/', {
    preHandler: [authenticate, validateBody(createAccountSchema)], 

  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      if (!request.userId) {
        throw new AccountErrors.ValidationError('User ID not found');
      }
      const existingAccount = await accountService.getUserAccounts(request.userId);
      if (existingAccount.length > 0) {
        throw new AccountErrors.AccountAlreadyExistsError('User already has an account', { langKey: 'account.create.alreadyExists' });
      }
      const { currency } = request.body as CreateAccountBody;
      
      const account = await accountService.createAccount({
        userId: request.userId,
        currency: currency || 'USD'
      });

      reply.code(201).send({
        message: t('account.create.success'),
        accessToken: request.accessToken,
        data: {...account, userId: request.userId}
      });
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

  // Get user accounts
  fastify.get('/', {
    preHandler: authenticate
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      if (!request.userId) {
        return reply.code(401).send({ error: 'User ID not found' });
      }
      const userId = request.userId;

      const key = `get_account:${userId}`;
      const result = await cacheWithRevalidation({
        key,
        ttl: 600,
        fetchFn: () => accountService.getUserAccounts(userId)
      });
      
      reply.send({
        message: t('account.get.success'),
        accessToken: request.accessToken,
        data: result.data,
        fromCache: result.fromCache
      });
    } catch (error: any) {
      console.error(error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      return {
        message: t(error.metadata.langKey || 'account.get.error'),
        error: error.message || 'An error occurred during registration',
        statusCode: error.statusCode || 500,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        details: error.details || null
      } as any;
    }
  });

  
}

export = accountRoutes;