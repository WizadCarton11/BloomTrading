import { PrismaClient, Account, Transaction, TransactionType, TransactionStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateAccountData, AccountResponse, CreateTransactionData, TransactionResponse
, GetTransactionsData, TransactionsWithPagination, TransferFundsData
, TransferResponse,
InitiateTransactionRequest,
InitiateTransactionResponse,
BuyStockRequest
 } from './account-object.interface';
import * as AccountErrors from '../errors/index';
import { bindAllMethods } from '../utils/bind-all-methods';
import { Decimal } from '@prisma/client/runtime/library';
import { sendKafkaMessage } from '../utils/kafka.producer';

const prisma = new PrismaClient();



class AccountService {
  async createAccount({ userId, accountType, currency }: CreateAccountData): Promise<AccountResponse> {
    // Generate unique account number
    const accountNumber = this.generateAccountNumber();
    console.log('Creating account for user:', userId, 'with account number:', accountNumber);
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
  
  async initiateTransaction(data: InitiateTransactionRequest): Promise<InitiateTransactionResponse> {
    const { userId } = data;

    // Validate user ID
    if (!userId) {
      throw new AccountErrors.ValidationError('User ID is required');
    }

    const account = await prisma.account.findFirst({
      where: {
        userId,
        isActive: true
      }
    });

    if (!account) {
      throw new AccountErrors.AccountNotFoundError(userId, { langKey: 'account.get.notFound' });
    }
    const transaction = await prisma.transaction.create({
      data: {
        accountId: account.id,
        type: TransactionType.DEBIT,
        amount: new Decimal(0), // Placeholder, will be updated later
        description: null,
        reference: null,
        status: TransactionStatus.INITIALIZED,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    return {
      transactionId: transaction.id,
      status: transaction.status,
    };
  }

  async buyStock(data: BuyStockRequest) {
    const { transactionId, stockSymbol, amount, userId } = data;
    
    // Validate input
    if (!transactionId || !stockSymbol || !amount || !userId || amount <= 0) {
      throw new AccountErrors.ValidationError('Transaction ID, stock symbol, amount and user ID are required');
    }

    // Find the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      throw new AccountErrors.TransactionNotFoundError(transactionId, { langKey: 'account.transaction.notFound' });
    }

    // Check if the transaction is in a valid state for buying stocks
    if (transaction.status !== TransactionStatus.INITIALIZED) {
      return {
        transactionId: transaction.id,
        status: transaction.status,
        message: 'Transaction is not in a valid state for buying stocks'
      };
    }

    // const updatedTransaction = await prisma.transaction.update({
    //   where: { id: transactionId },
    //   data: {
    //     type: TransactionType.CREDIT,
    //     amount: new Decimal(amount),
    //     description: `Bought stock ${stockSymbol} for ${amount} units`,
    //     status: TransactionStatus.PENDING,
    //     updatedAt: new Date()
    //   }
    // });
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // Lock the account balance
      const account = await tx.account.findUnique({
        where: { id: transaction.accountId }
      });
      if (!account) {
        throw new AccountErrors.AccountNotFoundError(transaction.accountId, { langKey: 'account.get.notFound' });
      }
      if (account.balance.lessThan(amount)) {
        throw new AccountErrors.InsufficientFundsError(account.accountNumber, Decimal(amount), { langKey: 'account.lock.insufficientFunds' });
      }
      await tx.account.update({
        where: { id: account.id },
        data: {
          balance: account.balance.minus(amount),
          lockedBalance: account.lockedBalance.plus(amount)
        }
      });
      // Update the transaction
      return await tx.transaction.update({
        where: { id: transactionId },
        data: {
          type: TransactionType.DEBIT,
          amount: new Decimal(amount),
          description: `Bought stock ${stockSymbol} for ${amount} Dollars for ${data.numberOfShares || 1} shares on average price ${data.averagePrice || 0}`,
          status: TransactionStatus.PENDING,
          updatedAt: new Date()
        }
      });
    });
    if (updatedTransaction instanceof Error) {
      console.error('Error updating transaction:', updatedTransaction);
      throw updatedTransaction;
    }
  await sendKafkaMessage('transactions', {
    event: 'transaction_created',
    data: {
      transactionId: updatedTransaction.id,
      userId: data.userId,
      stockSymbol: stockSymbol,
      amount: updatedTransaction.amount.toString(),
      numberOfShares: data.numberOfShares || 1,
      averagePrice: data.averagePrice || 0,
    }
  });
    return {
      transactionId: updatedTransaction.id,
      status: updatedTransaction.status
    };
    
  }

  async completeTransaction(transactionId: string): Promise<any> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });
    if (!transaction) {
      throw new AccountErrors.TransactionNotFoundError(transactionId, { langKey: 'account.transaction.notFound' });
    }
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new AccountErrors.TransactionInvalidStatusError(transactionId, transaction.status, { langKey: 'account.transaction.invalidStatus' });
    }
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: TransactionStatus.SUCCESS,
        updatedAt: new Date()
      }
    });
    return {
      transactionId: updatedTransaction.id,
      status: updatedTransaction.status
    };
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
  lockAmount,
  initiateTransaction,
  buyStock,
  completeTransaction
}= bindAllMethods(accountServiceInstance);