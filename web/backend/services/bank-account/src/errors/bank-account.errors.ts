import { Decimal } from '@prisma/client/runtime/library';
import { CustomError } from './custom.error';

/** Generic 404 Error */
export class NotFoundError extends CustomError {
  constructor(message = 'Resource not found', metadata: any = {}) {
    super(message, 404, 'NOT_FOUND', metadata);
  }
}

/** Request body or params failed validation */
export class ValidationError extends CustomError {
  constructor(message = 'Invalid data provided', metadata: any = {}) {
    super(message, 422, 'VALIDATION_ERROR', metadata);
  }
}

/** Invalid or missing authentication */
export class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized access', metadata: any = {}) {
    super(message, 401, 'UNAUTHORIZED', metadata);
  }
}

/** Forbidden access (valid auth, but not allowed to perform action) */
export class ForbiddenError extends CustomError {
  constructor(message = 'Access forbidden', metadata: any = {}) {
    super(message, 403, 'FORBIDDEN', metadata);
  }
}

export class InvalidRefreshTokenError extends CustomError {
  constructor(metadata: any = {}) {
    super('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN', metadata);
  }
}

/** Account already exists */
export class AccountAlreadyExistsError extends CustomError {
  constructor(accountId: string, metadata: any = {}) {
    super(`Account with ID ${accountId} already exists`, 409, 'ACCOUNT_ALREADY_EXISTS', { accountId, ...metadata });
  }
}
/** Account not found */
export class AccountNotFoundError extends CustomError {
  constructor(accountId: string, metadata: any = {}) {
    super(`Account with ID ${accountId} not found`, 404, 'ACCOUNT_NOT_FOUND', { accountId, ...metadata });
  }
}
/** Insufficient funds for transaction */
export class InsufficientFundsError extends CustomError {
  constructor(accountId: string, amount: Decimal, metadata: any = {}) {
    super(`Insufficient funds for account ${accountId} to withdraw ${amount}`, 400, 'INSUFFICIENT_FUNDS', { accountId, amount, ...metadata });
  }
}
/** Invalid transaction type */
export class InvalidTransactionTypeError extends CustomError {
  constructor(type: string, metadata: any = {}) {
    super(`Invalid transaction type: ${type}`, 400, 'INVALID_TRANSACTION_TYPE', { type, ...metadata });
  }
}
/** Transaction not found */
export class TransactionNotFoundError extends CustomError {
  constructor(transactionId: string, metadata: any = {}) {
    super(`Transaction with ID ${transactionId} not found`, 404, 'TRANSACTION_NOT_FOUND', { transactionId, ...metadata });
  }
}
/** Transaction already exists */
export class TransactionAlreadyExistsError extends CustomError {
  constructor(transactionId: string, metadata: any = {}) {
    super(`Transaction with ID ${transactionId} already exists`, 409, 'TRANSACTION_ALREADY_EXISTS', { transactionId, ...metadata });
  }
}
/** Invalid transaction amount */
export class InvalidTransactionAmountError extends CustomError {
  constructor(amount: number, metadata: any = {}) {
    super(`Invalid transaction amount: ${amount}`, 400, 'INVALID_TRANSACTION_AMOUNT', { amount, ...metadata });
  }
}
/** Generic error for unexpected issues */
export class GenericError extends CustomError {
  constructor(message = 'An unexpected error occurred', metadata: any = {}) {
    super(message, 500, 'GENERIC_ERROR', metadata);
  }
}
export class EmailNotVerifiedError extends CustomError {
  constructor(email: string, metadata: any = {}) {
    super(`Email ${email} not verified`, 403, 'EMAIL_NOT_VERIFIED', { email, ...metadata });
  }
}
export class AccountDisabledError extends CustomError {
  constructor(userId: string, metadata: any = {}) {
    super(`Account ${userId} is disabled`, 403, 'ACCOUNT_DISABLED', { userId, ...metadata });
  }
}
export class AccountCreationError extends CustomError {
  constructor(message = 'Error creating account', metadata: any = {}) {
    super(message, 500, 'ACCOUNT_CREATION_ERROR', metadata);
  }
}
export class TransactionCreationError extends CustomError {         
  constructor(message = 'Error creating transaction', metadata: any = {}) {
    super(message, 500, 'TRANSACTION_CREATION_ERROR', metadata);
  }
}
export class AccountUpdateError extends CustomError {
  constructor(message = 'Error updating account', metadata: any = {}) {
    super(message, 500, 'ACCOUNT_UPDATE_ERROR', metadata);
  }
}
export class TransactionUpdateError extends CustomError {
  constructor(message = 'Error updating transaction', metadata: any = {}) {
    super(message, 500, 'TRANSACTION_UPDATE_ERROR', metadata);
  }
}
export class AccountDeletionError extends CustomError {
  constructor(message = 'Error deleting account', metadata: any = {}) {
    super(message, 500, 'ACCOUNT_DELETION_ERROR', metadata);
  }
}
export class TransactionDeletionError extends CustomError {
  constructor(message = 'Error deleting transaction', metadata: any = {}) {
    super(message, 500, 'TRANSACTION_DELETION_ERROR', metadata);
  }
}
export class AccountBalanceError extends CustomError {
  constructor(message = 'Error retrieving account balance', metadata: any = {}) {
    super(message, 500, 'ACCOUNT_BALANCE_ERROR', metadata);
  }
}
export class TransactionHistoryError extends CustomError {
  constructor(message = 'Error retrieving transaction history', metadata: any = {}) {
    super(message, 500, 'TRANSACTION_HISTORY_ERROR', metadata);
  }
}
export class RateLimitExceededError extends CustomError {
  constructor(message = 'Rate limit exceeded', metadata: any = {}) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', metadata);
  }
}

export class TokenExpiredError extends CustomError {
  constructor(message = 'Token has expired', metadata: any = {}) {
    super(message, 401, 'TOKEN_EXPIRED', metadata);
  }
}
export class TokenValidationError extends CustomError {
  constructor(message = 'Token validation failed', metadata: any = {}) {
    super(message, 401, 'TOKEN_VALIDATION_ERROR', metadata);
  }
}