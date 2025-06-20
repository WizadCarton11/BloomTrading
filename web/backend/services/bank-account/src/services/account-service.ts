import { PrismaClient, Account, Transaction, TransactionType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateAccountData, AccountResponse, CreateTransactionData, TransactionResponse
, GetTransactionsData, TransactionsWithPagination, TransferFundsData
, TransferResponse
 } from './account-object.interface';
import * as AccountErrors from '../errors/index';
import { bindAllMethods } from '../utils/bind-all-methods';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();



class AccountService {
  async createAccount({ userId, accountType, currency }: CreateAccountData): Promise<AccountResponse> {
    // Generate unique account number
    const accountNumber = this.generateAccountNumber();

    const account = await prisma.account.create({
      data: {
        userId,
        accountNumber,
        
        currency,
        balance: 10000.00
      }
    });

    return {
      id: account.id,
      accountNumber: account.accountNumber,
      balance: account.balance.toString(),
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt
    };
  }

  async getUserAccounts(userId: string): Promise<AccountResponse[]> {
    const accounts = await prisma.account.findMany({
      where: {
        userId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return accounts.map(account => ({
      id: account.id,
      accountNumber: account.accountNumber,
      balance: account.balance.toString(),
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt
    }));
  }

  async getAccountById(accountId: string, userId: string): Promise<AccountResponse> {
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
        isActive: true
      }
    });

    if (!account) {
      throw new AccountErrors.AccountNotFoundError(accountId, { langKey: 'account.get.notFound' });
    }

    return {
      id: account.id,
      accountNumber: account.accountNumber,
      balance: account.balance.toString(),
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt
    };
  }

  async lockAmount(accountId: string, amount: Decimal): Promise<void> {
    const account = await prisma.account.findUnique({
      where: { id: accountId }
    }); 

    if (!account) {
      throw new AccountErrors.AccountNotFoundError(accountId, { langKey: 'account.lock.notFound' });
    }
    if (account.balance < amount) {
      throw new AccountErrors.InsufficientFundsError(accountId, amount, { langKey: 'account.lock.insufficientFunds' });
    }
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: account.balance.minus(amount),
        lockedBalance: account.lockedBalance.plus(amount)
      }
    });
  }

  private generateAccountNumber(): string {
    // Generate a simple account number (in production, use more sophisticated logic)
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ACC${timestamp.slice(-6)}${random}`;
  }
}

const accountServiceInstance = new AccountService();

// export const createAccount = accountServiceInstance.createAccount.bind(accountServiceInstance);
// export const getUserAccounts = accountServiceInstance.getUserAccounts.bind(accountServiceInstance);
// export const getAccountById = accountServiceInstance.getAccountById.bind(accountServiceInstance);
// export const createTransaction = accountServiceInstance.createTransaction.bind(accountServiceInstance);
// export const getAccountTransactions = accountServiceInstance.getAccountTransactions.bind(accountServiceInstance);
// export const transferFunds = accountServiceInstance.transferFunds.bind(accountServiceInstance);
export const {
  createAccount,
  getUserAccounts,
  getAccountById,
  lockAmount
}= bindAllMethods(accountServiceInstance);