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

/** Email is already in use */
export class EmailAlreadyExistsError extends CustomError {
  constructor(email: string, metadata: any = {}) {
    super(`Email ${email} already exists`, 409, 'EMAIL_ALREADY_EXISTS', { email, ...metadata });
  }
}

/** User not found */
export class UserNotFoundError extends CustomError {
  constructor(userIdOrEmail: string, metadata: any = {}) {
    super(`User ${userIdOrEmail} not found`, 404, 'USER_NOT_FOUND', { userIdOrEmail, ...metadata });
  }
}

/** Invalid login credentials */
export class InvalidCredentialsError extends CustomError {
  constructor(metadata: any = {}) {
    super('Invalid email or password', 401, 'INVALID_CREDENTIALS', metadata);
  }
}

/** Refresh token is invalid or expired */
export class InvalidRefreshTokenError extends CustomError {
  constructor(metadata: any = {}) {
    super('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN', metadata);
  }
}

/** Email not verified */
export class EmailNotVerifiedError extends CustomError {
  constructor(email: string, metadata: any = {}) {
    super(`Email ${email} is not verified`, 403, 'EMAIL_NOT_VERIFIED', { email, ...metadata });
  }
}

/** Account is disabled or blocked */
export class AccountDisabledError extends CustomError {
  constructor(userId: string, metadata: any = {}) {
    super(`Account ${userId} is disabled`, 403, 'ACCOUNT_DISABLED', { userId, ...metadata });
  }
}
