import 'dotenv/config';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import pino from 'pino';
import { CustomError } from './errors/custom.error';
import Redis from 'ioredis';
import { initI18n } from './i18';
import { RateLimitOptions, RateLimitErrorContext } from './index.interface';
import i18next from 'i18next';
import * as grpcServer from './grpc-server';
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
});


const isProd =false;

const app = fastify({
  logger: isProd
    ? {
        level: 'info'
      }
    : {
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

// Define interfaces for rate limit options


app.register(require('@fastify/rate-limit'), {
  max: 1000, 
  timeWindow: '1 minute', 
  keyGenerator: (request: FastifyRequest) => {
    return request.ip;
  },
  redis: redisClient,
  // allowList: ['127.0.0.1'], // Allow local requests without rate limiting
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
    // Skip rate limiting for health check endpoint
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
  // Log the error details for debugging
  // console.error('Error caught:', error);

  // Handle custom errors
  if (error instanceof CustomError) {
    // Only include stack trace in development environment
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

  // Handle all other unhandled errors
  return reply.status(500).send({
    statusCode: 500,
    error: 'InternalServerError',
    message: 'Something went wrong!',
    timestamp: new Date().toISOString(),
  });
});

// Load plugins
async function loadPlugins(): Promise<void> {
  await app.register(require('@fastify/cors'), {
    origin: true
  });
  
  await app.register(require('@fastify/helmet'));
}

// Load routes
async function loadRoutes(): Promise<void> {
  await app.register(require('./routes/accounts'), { prefix: '/api/accounts' });
}

// Health check
app.get('/health', async (request, reply) => {
  const lang = request.headers['x-lang'] || 'en';
  const t = i18next.getFixedT(lang);
  return { status: 'healthy', service: t('healthCheck') };
});

async function start(): Promise<void> {
  try {
    // Load plugins and routes
    await initI18n();
    await loadPlugins();
    await loadRoutes();
    grpcServer.start();
    // Start HTTP server
    const port = parseInt(process.env.HTTP_PORT || '3002');
    await app.listen({ port, host: '0.0.0.0' });
    
    console.log(`Bank account service HTTP server running on port ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();