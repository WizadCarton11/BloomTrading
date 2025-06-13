import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as accountService from '../services/account-service';
import * as grpcClient from '../grpc-client';

interface CreateAccountBody {
  accountType?: string;
  currency?: string;
}

interface CreateTransactionBody {
  type: string;
  amount: string;
  description?: string;
  reference?: string;
}

interface TransferBody {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description?: string;
}

interface AccountParams {
  accountId: string;
}

interface TransactionQuery {
  page?: string;
  limit?: string;
}

interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
}

// Auth middleware
async function authenticate(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      reply.code(401).send({ error: 'No token provided' });
      return;
    }

    const validation = await grpcClient.validateToken(token);
    if (!validation.valid) {
      reply.code(401).send({ error: 'Invalid token' });
      return;
    }

    request.userId = validation.user_id;
  } catch (error: any) {
    reply.code(401).send({ error: 'Authentication failed' });
  }
}

async function accountRoutes(fastify: FastifyInstance): Promise<void> {
  // Create account
  fastify.post<{ Body: CreateAccountBody }>('/', {
    preHandler: authenticate
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      if (!request.userId) {
        return reply.code(401).send({ error: 'User ID not found' });
      }

      const { accountType, currency } = request.body as CreateAccountBody;
      
      const account = await accountService.createAccount({
        userId: request.userId,
        accountType: accountType || 'CHECKING',
        currency: currency || 'USD'
      });

      reply.code(201).send(account);
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
      reply.send(accounts);
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
      reply.send(account);
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

      reply.code(201).send(transaction);
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

      reply.send(transactions);
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

      reply.send(transfer);
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });
}

export = accountRoutes;