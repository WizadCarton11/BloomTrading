import { FastifyRequest } from 'fastify';

export interface CreateAccountBody {
  accountType?: string;
  currency?: string;
}

export interface CreateTransactionBody {
  type: string;
  amount: string;
  description?: string;
  reference?: string;
}

export interface TransferBody {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description?: string;
}

export interface AccountParams {
  accountId: string;
}

export interface TransactionQuery {
  page?: string;
  limit?: string;
}