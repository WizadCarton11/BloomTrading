import 'dotenv/config';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify';
import * as grpcServer from './grpc-server';
import pino from 'pino';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { CustomError } from './errors/custom.error';
import Redis from 'ioredis';

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

// Define interfaces for rate limit options
interface RateLimitErrorContext {
  statusCode: number;
  error: string;
  limit: number;
  remaining: number;
  reset: number;
  ttl: number;
  ban?: boolean;
}

interface BanOptions {
  duration: number;
  max: number;
  keyGenerator: (request: FastifyRequest) => string;
  redis: Redis;
}

interface RateLimitOptions {
  max: number;
  timeWindow: string | number;
  keyGenerator: (request: FastifyRequest) => string;
  redis: Redis;
  ban: BanOptions;
  skipOnError: boolean;
  skip: (request: FastifyRequest) => boolean;
  errorResponseBuilder: (req: FastifyRequest, context: RateLimitErrorContext) => {
    statusCode: number;
    error: string;
    message: string;
  };
}

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
  // await app.register(fastifySwagger, {
  //   swagger: {
  //     info: {
  //       title: 'Auth API',
  //       description: 'API documentation for the authentication service',
  //       version: '1.0.0',
  //     },
  //     externalDocs: {
  //       url: 'https://swagger.io',
  //       description: 'Find more info here',
  //     },
  //     host: 'localhost:3001',
  //     schemes: ['http'],
  //     consumes: ['application/json'],
  //     produces: ['application/json'],
  //   },
  // });
  
  // await app.register(fastifySwaggerUi, {
  //   routePrefix: '/docs',
  //   uiConfig: {
  //     docExpansion: 'list', // or 'full', 'none'
  //     deepLinking: true,
  //   },
  //   staticCSP: true,
  //   transformSpecificationClone: true,
  // });
  await app.register(require('@fastify/cors'), {
    origin: true
  });
  
  await app.register(require('@fastify/helmet'));
  // Global error handler
}


// Load routes
async function loadRoutes(): Promise<void> {
  await app.register(require('./routes/auth'), { prefix: '/api/auth' });
}

// Health check
app.get('/health', async (request, reply) => {
  return { status: 'healthy', service: 'auth-service' };
});

async function start(): Promise<void> {
  try {
    // Load plugins and routes
    await loadPlugins();
    await loadRoutes();
    
    // Start gRPC server
    grpcServer.start();
    
    // Start HTTP server
    const port = parseInt(process.env.HTTP_PORT || '3001');
    await app.listen({ port, host: '0.0.0.0' });
    
    console.log(`Auth service HTTP server running on port ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();