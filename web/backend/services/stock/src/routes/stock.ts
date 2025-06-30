import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as grpcClient from '../grpc-client';
import * as StockErrors from '../errors/index';
import { access } from 'fs';
import i18next from 'i18next';
import * as StockService from '../services/stock.service';
import { cacheWithRevalidation } from '../utils/cache_with_revalidation';
interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  accessToken?: string;
}
// Auth middleware
async function authenticate(request: FastifyRequest & Partial<AuthenticatedRequest>,  reply: FastifyReply): Promise<void> {
  try {
    const authAccessToken :string = request.cookies['accessToken'] || request.headers.authorization || "";
    const refreshTokenHeader = request.headers['x-refresh-token'];
    const authRefreshToken : string = request.cookies['refreshToken'] || (Array.isArray(refreshTokenHeader) ? refreshTokenHeader[0] : refreshTokenHeader) || "";
    const lang= request.headers['x-lang'] || 'en';
    const t = i18next.getFixedT(lang);

    const validation = await grpcClient.validateToken(authAccessToken, authRefreshToken);
    if (!validation.valid) {
      console.error(validation.error);
      if (validation.error?.toLowerCase() === 'jwt expired') {
        throw new StockErrors.TokenExpiredError('Token has expired');
      }
      if (validation.error?.toLowerCase() === 'jwt malformed') {
        throw new StockErrors.ValidationError('Malformed token');
      }
      if (validation.error?.toLowerCase() === 'invalid or expired refresh token'){
        throw new StockErrors.InvalidRefreshTokenError('Invalid or expired refresh token');
      }
      throw new StockErrors.ValidationError('Invalid token');
    }

    request.userId = validation.user_id;
    request.accessToken = validation.accessToken;
  } catch (error: any) {
    throw error;
  }
}

async function stockRoutes(fastify: FastifyInstance): Promise<void> {

   fastify.post<{ Body: any }>('/test', {
    preHandler: [authenticate], 

  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const lang = request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      return reply.send({ message: t('test.success') });
    } catch (error: any) {
      console.error(error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      return {
        message: t(error.metadata.langKey || 'account.create.error'),
        error: error.message || 'An error occurred during registration',
        statusCode: error.statusCode || 500,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        details: error.details || null
      } as any;
    }
  });
  
  fastify.get<{ Querystring : { limit: number, offset: number } }>('/stocksList', {
    preHandler: [authenticate],
  }, async (request: AuthenticatedRequest & Partial<any>, reply: FastifyReply) => {
    try {
      const lang = request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      const { limit, offset } = request.query as { limit: number, offset: number };
      const cacheKey = `stocksList:${limit}:${offset}`;
      const result= await cacheWithRevalidation({
        key:cacheKey,
        ttl: 10000,
        fetchFn: async () => {
          return StockService.getStocks(limit, offset);
        }
        }
      )
      const stocks = await StockService.getStocks(limit, offset);
      // const data= await StockService.getStocks(limit, offset);
      return reply.send({ message: t('stock.get.success'),
         data: result.data, accessToken: request.accessToken,
        fromCache: result.fromCache
        });
    } catch (error: any) {
      console.error(error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);

      return {
        message: t(error.metadata.langKey || 'account.create.error'),
        error: error.message || 'An error occurred during registration',
        statusCode: error.statusCode || 500,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        details: error.details || null
      } as any;
    }
  });
    
}


export = stockRoutes;