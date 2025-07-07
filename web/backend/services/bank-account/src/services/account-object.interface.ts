import { PrismaClient, Account, Transaction, TransactionType } from '@prisma/client';
import { FastifyRequest } from 'fastify';
export interface CreateAccountData {
  userId: string;
  accountType: string;
  currency: string;
}

export interface CreateTransactionData {
  accountId: string;
  userId: string;
  type: string;
  amount: number;
  description?: string;
  reference?: string;
}

export interface GetTransactionsData {
  accountId: string;
  userId: string;
  page: number;
  limit: number;
}

export interface TransferFundsData {
  fromAccountId: string;
  toAccountId: string;
  userId: string;
  amount: number;
  description?: string;
}

export interface AccountResponse {
  id: string;
  accountNumber: string;
  balance: string;
  currency: string;
  isActive: boolean;
  createdAt: Date;
}

export interface TransactionResponse {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: string;
  description: string | null;
  reference: string | null;
  balanceBefore: string;
  balanceAfter: string;
  createdAt: Date;
}

export interface TransactionsWithPagination {
  transactions: TransactionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransferResponse {
  transferReference: string;
  fromTransaction: TransactionResponse;
  toTransaction: TransactionResponse;
}

export interface InitiateTransactionRequest {
  userId: string;
}

export interface InitiateTransactionResponse {
  transactionId: string;
  status: string;
  message?: string;
}
interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  accessToken?: string;
}

export interface BuyStockRequest extends AuthenticatedRequest {
  transactionId: string;
  stockSymbol: string;
  amount: number;
  numberOfShares?: number;
  averagePrice?: number;
}

export interface BuyStockResponse {
  transactionId: string;
  status: string;
  message?: string;
}