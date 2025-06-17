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

async function stockRoutes(fastify: FastifyInstance): Promise<void> {
  // Create account
  
}

export = stockRoutes;