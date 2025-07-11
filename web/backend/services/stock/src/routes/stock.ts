import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as grpcClient from '../grpc-client';
import * as StockErrors from '../errors/index';
import { access } from 'fs';
import i18next from 'i18next';
import * as StockService from '../services/stock.service';
import { cacheWithRevalidation, redisClient } from '../utils/cache_with_revalidation';
import { RedisClient } from 'ioredis/built/connectors/SentinelConnector/types';
interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  accessToken?: string;
}
// Auth middleware
async function authenticate(request: FastifyRequest & Partial<AuthenticatedRequest>,  reply: FastifyReply): Promise<void> {
  try {
    const authAccessToken :string  = request.headers.authorization?.split('Bearer ')[1] || ""
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
      throw error
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

      throw error;
    }
  });

  fastify.get<{ Params: { name: string } }>('/stock_details/:name', {
    preHandler: [authenticate],
  }, async (request: AuthenticatedRequest & Partial<any>, reply: FastifyReply) => {
    try {
      const lang = request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      const { name } = request.params as { name: string };
      let cacheKey = `stock:${name}`;
      const result= await cacheWithRevalidation({
        key:cacheKey,
        ttl: 10000,
        fetchFn: async () => {
          return StockService.getStockBySymbol(name);
        }
        }
      )
      cacheKey = `live:${name.toUpperCase().trim()}`;
      console.log('cacheKey', cacheKey);
      const liveData = await redisClient.zrangebyscore(cacheKey, '-inf', '+inf');
      const parsedLiveData = liveData.map(item => JSON.parse(item));
      parsedLiveData.forEach(item => {
        item.formattedDate = new Date(item.timestamp).toLocaleString(lang, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
      });
      // const data= await StockService.getStockBySymbol(name);
      // const result = await StockService.getStockBySymbol(name);
      return reply.send({ message: t('stock.get.success'),
         data: result.data, accessToken: request.accessToken,
        fromCache: result.fromCache,
        liveData: parsedLiveData
        });
    } catch (error: any) {
      console.error(error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);

      throw error;
    }
  });
  // get list of stocks with details
  fastify.get<{ Querystring: {  listOfStocks: string } }>('/get_stocks_details', {
    preHandler: [authenticate],
  }, async (request: AuthenticatedRequest & Partial<any>, reply: FastifyReply) => {
    try {
      const lang = request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      const { listOfStocks } = request.query as { listOfStocks: string };
      const stocksArray = listOfStocks.split(',').map(stock => stock.trim());
      console.log('stocksArray', stocksArray);
      const cacheKey = `stocksDetails:${stocksArray.join(',')}`;
      const result = await cacheWithRevalidation({
        key: cacheKey,
        ttl: 10000,
        fetchFn: async () => {
          return StockService.getStocksDetails(stocksArray);
        }
      });
      // const data = await StockService.getStocksDetails(stocksArray);
      return reply.send({ message: t('stock.get.success'),
         data: result.data, accessToken: request.accessToken,
        fromCache: result.fromCache
        });
    } catch (error: any) {
      console.error(error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);      
      throw error
    }
  });

  fastify.get<{ Params: { name: string } }>('/get_today_data/:name', {
    preHandler: [authenticate],
  }, async (request: AuthenticatedRequest & Partial<any>, reply: FastifyReply) => {
    try {
      const lang = request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      const { name } = request.params as { name: string };
      
      const cacheKey = `live:${name.toUpperCase().trim()}`;
      console.log('cacheKey', cacheKey);
      const result = await redisClient.zrangebyscore(cacheKey, '-inf', '+inf');
      const parsed = result.map(item => JSON.parse(item));
      parsed.forEach(item => {
        item.formattedDate = new Date(item.timestamp).toLocaleString(lang, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit', 
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        item.date = new Date(item.timestamp).toISOString();
        item.price = parseFloat(item.price);
      });
      return reply.send({ message: t('stock.get.success'),
         data: parsed, accessToken: request.accessToken,
        
        });
    } catch (error: any) {
      console.error(error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);

      throw error
    }
  });

  fastify.get('/get_portfolio', {
    preHandler: [authenticate],
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const lang = request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      // user redis
      const userId = request.userId;
      if (!userId) {
        throw new StockErrors.ValidationError('User ID is required');
      }
      const cacheKey = `portfolio:${userId}`;
      const result = await cacheWithRevalidation({
        key: cacheKey,
        ttl: 10000,
        fetchFn: async () => {
          return StockService.getPortfolio(userId);
        }
      });
      return reply.send({ message: t('stock.get.success'),
         data: result.data, accessToken: request.accessToken,
        fromCache: result.fromCache
        });
    } catch (error: any) {
      console.error(error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);      
      throw error
    }
  });

  // get stock by userId and symbol
  fastify.get<{ Params: { symbol: string } }>('/get_stock_by_user/:symbol', {
    preHandler: [authenticate],
  }, async (request: AuthenticatedRequest & Partial<any>, reply: FastifyReply) => {
    try {
      const lang = request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      const { symbol } = request.params as { symbol: string };
      const userId = request.userId;
      if (!userId) {
        throw new StockErrors.ValidationError('User ID is required');
      }
      const cacheKey = `stock:${userId}:${symbol}`;
      // const result = await cacheWithRevalidation({
      //   key: cacheKey,
      //   ttl: 10000,
      //   fetchFn: async () => {
      //     return StockService.getStockByUserIdAndSymbol(userId, symbol);
      //   }
      // });
      const data = await StockService.getStockByUserIdAndSymbol(userId, symbol);
      return reply.send({ message: t('stock.get.success'),
         data: data, accessToken: request.accessToken,
        // fromCache: result.fromCache
        });
    } catch (error: any) {
      console.error(error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);      
      throw error
    }
  });

  
    
}


export = stockRoutes;