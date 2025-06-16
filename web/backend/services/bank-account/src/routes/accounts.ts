import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as accountService from '../services/account-service';
import * as grpcClient from '../grpc-client';
import { CreateAccountBody, AccountParams, TransferBody, TransactionQuery, CreateTransactionBody } from '../types';
import * as AccountErrors from '../errors/index';
import { access } from 'fs';

interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  accessToken?: string;
}

// Auth middleware
async function authenticate(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    const refreshtoken= request.headers['x-refresh-token'] as string;
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
  fastify.post<{ Body: CreateAccountBody }>('/', {
    preHandler: authenticate
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      if (!request.userId) {
        throw new AccountErrors.ValidationError('User ID not found');
      }

      const { accountType, currency } = request.body as CreateAccountBody;
      
      const account = await accountService.createAccount({
        userId: request.userId,
        accountType: accountType || 'CHECKING',
        currency: currency || 'USD'
      });

      reply.code(201).send({
        
        accessToken: request.accessToken,
        data: {...account, userId: request.userId}
      });
    } catch (error: any) {
      console.error(error);
      reply.code(400).send({ error: error.message });
    }
  });

  // Get user accounts
  fastify.get('/', {
    preHandler: authenticate
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      if (!request.userId) {
        return reply.code(401).send({ error: 'User ID not found' });
      }

      const accounts = await accountService.getUserAccounts(request.userId);
      reply.send({
        accessToken: request.accessToken,
        data: accounts
      });
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get account by ID
  fastify.get<{ Params: AccountParams }>('/:accountId', {
    preHandler: authenticate
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      if (!request.userId) {
        return reply.code(401).send({ error: 'User ID not found' });
      }

      const { accountId } = request.params as any;
      const account = await accountService.getAccountById(accountId, request.userId);
      reply.send({
        accessToken: request.accessToken,
        data: account
      });
    } catch (error: any) {
      reply.code(404).send({ error: error.message });
    }
  });

  // Create transaction
  fastify.post<{ Params: AccountParams; Body: CreateTransactionBody }>('/:accountId/transactions', {
    preHandler: authenticate
  }, async (request: AuthenticatedRequest & FastifyRequest<{ Params: AccountParams }>, reply: FastifyReply) => {
    try {
      if (!request.userId) {
        return reply.code(401).send({ error: 'User ID not found' });
      }

      const { accountId } = request.params;
      const { type, amount, description, reference } = request.body as CreateTransactionBody;

      if (!type || !amount) {
        return reply.code(400).send({
          error: 'Transaction type and amount are required'
        });
      }

      const transaction = await accountService.createTransaction({
        accountId,
        userId: request.userId,
        type,
        amount: parseFloat(amount),
        description,
        reference
      });

      reply.code(201).send({
        accessToken: request.accessToken,
        data: transaction
      });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Get account transactions
  fastify.get<{ Params: AccountParams; Querystring: TransactionQuery }>('/:accountId/transactions', {
    preHandler: authenticate
  }, async (request: AuthenticatedRequest & FastifyRequest<{ Params: AccountParams; Querystring: TransactionQuery }>, reply: FastifyReply) => {
    try {
      if (!request.userId) {
        return reply.code(401).send({ error: 'User ID not found' });
      }

      const { accountId } = request.params;
      const { page = '1', limit = '10' } = request.query as TransactionQuery;

      const transactions = await accountService.getAccountTransactions({
        accountId,
        userId: request.userId,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      reply.send({
        accessToken: request.accessToken,
        data: transactions
      });
    } catch (error: any) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Transfer between accounts
  fastify.post<{ Body: TransferBody }>('/transfer', {
    preHandler: authenticate
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      if (!request.userId) {
        return reply.code(401).send({ error: 'User ID not found' });
      }

      const { fromAccountId, toAccountId, amount, description } = request.body as any;

      if (!fromAccountId || !toAccountId || !amount) {
        return reply.code(400).send({
          error: 'From account, to account, and amount are required'
        });
      }

      const transfer = await accountService.transferFunds({
        fromAccountId,
        toAccountId,
        userId: request.userId,
        amount: parseFloat(amount),
        description
      });

      reply.send({
        accessToken: request.accessToken,
        data: transfer
      });
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });
}

export = accountRoutes;