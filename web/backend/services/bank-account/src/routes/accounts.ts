import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as accountService from '../services/account-service';
import * as grpcClient from '../grpc-client';
import { CreateAccountBody, AccountParams, TransferBody, TransactionQuery, CreateTransactionBody } from '../types';
import * as AccountErrors from '../errors/index';
import { access } from 'fs';
import { validateBody } from '../middleware/accounts.middleware';
import { buyStockSchema, CreateAccountRequest, createAccountSchema } from '../schemas';
import i18next from 'i18next';
import { cacheWithRevalidation } from '../utils/cahce_with_revalidation';
import { BuyStockRequest } from '../services/account-object.interface';

interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  accessToken?: string;
}

// Auth middleware
async function authenticate(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
  try {
    const authAccessToken :string  = request.headers.authorization?.split('Bearer ')[1] || ""
    console.log('authAccessToken', authAccessToken);
    const refreshTokenHeader = request.headers['x-refresh-token'];
    const authRefreshToken : string = request.cookies['refreshToken'] || (Array.isArray(refreshTokenHeader) ? refreshTokenHeader[0] : refreshTokenHeader) || "";
    const lang= request.headers['x-lang'] || 'en';
    const t = i18next.getFixedT(lang);
    if (!authAccessToken && !authRefreshToken) {
      throw new AccountErrors.UnauthorizedError('No authorization token provided');
    }

    const validation = await grpcClient.validateToken(authAccessToken, authRefreshToken);
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
      throw error
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

  fastify.get('/initiate_transaction', {
    preHandler: authenticate
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      if (!request.userId) {
        return reply.code(401).send({ error: 'User ID not found' });
      }
      const userId = request.userId;;


      const transaction = await accountService.initiateTransaction({
        userId,
      });

      reply.send({
        message: t('account.transaction.initiated'),
        accessToken: request.accessToken,
        data: transaction
      });
    } catch (error: any) {
      console.error(error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      throw error;
    }
  });

  fastify.post<{ Body: BuyStockRequest}>('/buy_stock', {
    preHandler: [authenticate, validateBody(buyStockSchema)]
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      if (!request.userId) {
        return reply.code(401).send({ error: 'User ID not found' });
      }
      console.log(request.body);
      const { transactionId, stockSymbol, amount, numberOfShares , averagePrice} = request.body as BuyStockRequest;

      if (!transactionId || !stockSymbol || !amount) {
        throw new AccountErrors.ValidationError('Transaction ID, stock symbol and amount are required');
      }

      const transaction = await accountService.buyStock({
        userId: request.userId,
        transactionId,
        stockSymbol,
        amount,
        numberOfShares: numberOfShares || 1,
        averagePrice: averagePrice || 0
      });

      reply.send({
        message: t('account.stock.purchase.success'),
        accessToken: request.accessToken,
        data: transaction
      });
    } catch (error: any) {
      console.error(error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      console.error('Error in buy_stock:', error);
      throw error;
    }
  });

  
}

export = accountRoutes;