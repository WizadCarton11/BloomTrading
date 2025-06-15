import { PrismaClient, Account, Transaction, AccountType, TransactionType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateAccountData, AccountResponse, CreateTransactionData, TransactionResponse
, GetTransactionsData, TransactionsWithPagination, TransferFundsData
, TransferResponse
 } from './account-object.interface';
const prisma = new PrismaClient();



class AccountService {
  async createAccount({ userId, accountType, currency }: CreateAccountData): Promise<AccountResponse> {
    // Generate unique account number
    const accountNumber = this.generateAccountNumber();

    const account = await prisma.account.create({
      data: {
        userId,
        accountNumber,
        accountType: accountType as AccountType,
        currency,
        balance: 10000.00
      }
    });

    return {
      id: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
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
      accountType: account.accountType,
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
      throw new Error('Account not found');
    }

    return {
      id: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance.toString(),
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt
    };
  }

  async createTransaction({ accountId, userId, type, amount, description, reference }: CreateTransactionData): Promise<TransactionResponse> {
    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
        isActive: true
      }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const currentBalance = parseFloat(account.balance.toString());

    // Validate transaction
    if (type === 'WITHDRAWAL' && currentBalance < amount) {
      throw new Error('Insufficient funds');
    }

    // Calculate new balance
    let newBalance: number;
    switch (type) {
      case 'DEPOSIT':
      case 'TRANSFER_IN':
        newBalance = currentBalance + amount;
        break;
      case 'WITHDRAWAL':
      case 'TRANSFER_OUT':
        newBalance = currentBalance - amount;
        break;
      default:
        throw new Error('Invalid transaction type');
    }

    // Create transaction and update balance in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          accountId,
          type: type as TransactionType,
          amount,
          description,
          reference,
          balanceBefore: currentBalance,
          balanceAfter: newBalance
        }
      });

      // Update account balance
      await prisma.account.update({
        where: { id: accountId },
        data: { balance: newBalance }
      });

      return transaction;
    });

    return {
      id: result.id,
      accountId: result.accountId,
      type: result.type,
      amount: result.amount.toString(),
      description: result.description,
      reference: result.reference,
      balanceBefore: result.balanceBefore.toString(),
      balanceAfter: result.balanceAfter.toString(),
      createdAt: result.createdAt
    };
  }

  async getAccountTransactions({ accountId, userId, page, limit }: GetTransactionsData): Promise<TransactionsWithPagination> {
    // Verify account ownership
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId,
        isActive: true
      }
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { accountId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaction.count({
        where: { accountId }
      })
    ]);

    return {
      transactions: transactions.map(tx => ({
        id: tx.id,
        accountId: tx.accountId,
        type: tx.type,
        amount: tx.amount.toString(),
        description: tx.description,
        reference: tx.reference,
        balanceBefore: tx.balanceBefore.toString(),
        balanceAfter: tx.balanceAfter.toString(),
        createdAt: tx.createdAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async transferFunds({ fromAccountId, toAccountId, userId, amount, description }: TransferFundsData): Promise<TransferResponse> {
    // Verify both accounts belong to user
    const [fromAccount, toAccount] = await Promise.all([
      prisma.account.findFirst({
        where: { id: fromAccountId, userId, isActive: true }
      }),
      prisma.account.findFirst({
        where: { id: toAccountId, userId, isActive: true }
      })
    ]);

    if (!fromAccount || !toAccount) {
      throw new Error('One or both accounts not found');
    }

    const fromBalance = parseFloat(fromAccount.balance.toString());

    if (fromBalance < amount) {
      throw new Error('Insufficient funds');
    }

    // Perform transfer in transaction
    const result = await prisma.$transaction(async (prisma) => {
      const transferRef = uuidv4();

      // Create outgoing transaction
      const outTransaction = await prisma.transaction.create({
        data: {
          accountId: fromAccountId,
          type: 'TRANSFER_OUT',
          amount,
          description: description || `Transfer to ${toAccount.accountNumber}`,
          reference: transferRef,
          balanceBefore: fromBalance,
          balanceAfter: fromBalance - amount
        }
      });

      // Create incoming transaction
      const toBalance = parseFloat(toAccount.balance.toString());
      const inTransaction = await prisma.transaction.create({
        data: {
          accountId: toAccountId,
          type: 'TRANSFER_IN',
          amount,
          description: description || `Transfer from ${fromAccount.accountNumber}`,
          reference: transferRef,
          balanceBefore: toBalance,
          balanceAfter: toBalance + amount
        }
      });

      // Update balances
      await Promise.all([
        prisma.account.update({
          where: { id: fromAccountId },
          data: { balance: fromBalance - amount }
        }),
        prisma.account.update({
          where: { id: toAccountId },
          data: { balance: toBalance + amount }
        })
      ]);

      return { outTransaction, inTransaction, transferRef };
    });

    return {
      transferReference: result.transferRef,
      fromTransaction: {
        id: result.outTransaction.id,
        accountId: result.outTransaction.accountId,
        type: result.outTransaction.type,
        amount: result.outTransaction.amount.toString(),
        description: result.outTransaction.description,
        reference: result.outTransaction.reference,
        balanceBefore: result.outTransaction.balanceBefore.toString(),
        balanceAfter: result.outTransaction.balanceAfter.toString(),
        createdAt: result.outTransaction.createdAt
      },
      toTransaction: {
        id: result.inTransaction.id,
        accountId: result.inTransaction.accountId,
        type: result.inTransaction.type,
        amount: result.inTransaction.amount.toString(),
        description: result.inTransaction.description,
        reference: result.inTransaction.reference,
        balanceBefore: result.inTransaction.balanceBefore.toString(),
        balanceAfter: result.inTransaction.balanceAfter.toString(),
        createdAt: result.inTransaction.createdAt
      }
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

export const createAccount = accountServiceInstance.createAccount.bind(accountServiceInstance);
export const getUserAccounts = accountServiceInstance.getUserAccounts.bind(accountServiceInstance);
export const getAccountById = accountServiceInstance.getAccountById.bind(accountServiceInstance);
export const createTransaction = accountServiceInstance.createTransaction.bind(accountServiceInstance);
export const getAccountTransactions = accountServiceInstance.getAccountTransactions.bind(accountServiceInstance);
export const transferFunds = accountServiceInstance.transferFunds.bind(accountServiceInstance);