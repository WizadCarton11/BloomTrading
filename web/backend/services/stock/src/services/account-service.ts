import { PrismaClient, Account, Transaction, AccountType, TransactionType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateAccountData, AccountResponse, CreateTransactionData, TransactionResponse
, GetTransactionsData, TransactionsWithPagination, TransferFundsData
, TransferResponse
 } from './stocks.interface';
import * as AccountErrors from '../errors/index';

const prisma = new PrismaClient();



class StockService {
  
}

const accountServiceInstance = new StockService();

// export const createAccount = accountServiceInstance.createAccount.bind(accountServiceInstance);
// export const getUserAccounts = accountServiceInstance.getUserAccounts.bind(accountServiceInstance);
// export const getAccountById = accountServiceInstance.getAccountById.bind(accountServiceInstance);
// export const createTransaction = accountServiceInstance.createTransaction.bind(accountServiceInstance);
// export const getAccountTransactions = accountServiceInstance.getAccountTransactions.bind(accountServiceInstance);
// export const transferFunds = accountServiceInstance.transferFunds.bind(accountServiceInstance);