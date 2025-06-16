import 'dotenv/config';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import * as grpcServer from './grpc-server';
import pino from 'pino';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { CustomError } from './errors/custom.error';
import Redis from 'ioredis';
import { RateLimitOptions, RateLimitErrorContext } from './index.interface';
import i18next from 'i18next';
import { initI18n } from './i18';

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
});

const isProd = false;

const app = fastify({
  logger: {
    level: 'warn',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname'
      }
    }
  }
});
app.addHook('preHandler', async (request, reply) => {
  const lang = request.headers['accept-language']?.split(',')[0] || 'en';
  request.headers['x-lang'] = lang; // Optional: attach to header for reuse
});

app.register(require('@fastify/rate-limit'), {
  max: 1000, 
  timeWindow: '1 minute', 
  keyGenerator: (request: FastifyRequest) => {
    return request.ip;
  },
  redis: redisClient,
  allowList: ['127.0.0.1'], // Allow local requests without rate limiting
  ban: {
    duration: 60 * 60 * 1000, // Ban for 1 hour
    max: 1, // Ban after 10 failed attempts
    keyGenerator: (request: FastifyRequest) => {
      // Use the IP address as the key for banning
      return request.ip;
    },
    redis: redisClient
  },
  skipOnError: true,
  skip: (request: FastifyRequest) => {
    return request.url === '/health' || request.routeOptions?.url === '/health';
  },
  errorResponseBuilder: function (req: FastifyRequest, context: RateLimitErrorContext) {
    if (context.ban) {
      return {
        statusCode: 403,
        error: 'Forbidden',
        message: 'You are temporarily banned due to suspicious activity.',
      };
    }

    return {
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)}s.`,
    };
  },
} as RateLimitOptions);

app.setErrorHandler((error, request, reply) => {
  // console.error('Error caught:', error);

  if (error instanceof CustomError) {
    const response: any = {
      statusCode: error.statusCode,
      error: error.code,
      message: error.message,
      timestamp: error.timestamp,
      metadata: error.metadata,
    };

    if (process.env.NODE_ENV === 'development') {
      response.stack = error.stack;
    }

    return reply.status(error.statusCode).send(response);
  }

  return reply.status(500).send({
    statusCode: 500,
    error: 'InternalServerError',
    message: 'Something went wrong!',
    timestamp: new Date().toISOString(),
  });
});

async function loadPlugins(): Promise<void> {
  await app.register(require('@fastify/cors'), {
    origin: true
  });
  
  await app.register(require('@fastify/helmet'));
}

async function loadRoutes(): Promise<void> {
  await app.register(require('./routes/auth'), { prefix: '/api/auth' });
}

app.get('/health', async (request, reply) => {
  const lang = request.headers['x-language'] || 'en';
  const t = i18next.getFixedT(lang);
  return { status: 'healthy', service: t('healthCheck') };
});

async function start(): Promise<void> {
  try {
    await initI18n();
    await loadPlugins();
    await loadRoutes();
    grpcServer.start();
    
    const port = parseInt(process.env.HTTP_PORT || '3001');
    await app.listen({ port, host: '0.0.0.0' });
    
    console.log(`Auth service HTTP server running on port ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();