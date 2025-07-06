import 'dotenv/config';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import pino from 'pino';
import { CustomError } from './errors/custom.error';
import Redis from 'ioredis';
import { initI18n } from './i18';
import { RateLimitOptions, RateLimitErrorContext } from './index.interface';
import i18next from 'i18next';
import * as grpcServer from './grpc-server';
import { setupWebSocket } from './utils/websocket';
import { createKafkaConsumer } from './utils/kafka.consumer';
import '@fastify/cookie';
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
import compress from '@fastify/compress';




app.register(require('@fastify/cookie'), {
  secret: process.env.COOKIE_SECRET || 'default-secret', // ⬅️ Required
  hook: 'onRequest',
  parseOptions: {
    path: '/',
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    signed: true, // ⬅️ Required
  },
});

app.addHook('onRequest', async (request, _reply) => {
  const raw = request.cookies['refreshToken'];
  if (raw) {
    const { value, valid } = request.unsignCookie(raw);
    if (valid) {
      request.cookies['refreshToken'] = value;
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
// async function loadPlugins(): Promise<void> {
//   await app.register(require('@fastify/cors'), {
//     origin: true
//   });
  
//   await app.register(require('@fastify/helmet'));
// }

async function loadPlugins(): Promise<void> {
  interface CorsOriginCallback {
    (error: Error | null, allow: boolean): void;
  }

  interface CorsOptions {
    origin: (origin: string | undefined, cb: CorsOriginCallback) => void;
    credentials: boolean;
  }
  await app.register(compress, {
    global: true,
    encodings: ['gzip', 'deflate'],
    threshold: 1024 // Only compress responses larger than 1KB
  });
  await app.register(require('@fastify/cors'), {
    origin: (origin: string | undefined, cb: CorsOriginCallback) => {
      const allowedOrigins: string[] = ['http://localhost:3000', 'https://yourfrontend.com'];
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        console.warn(`CORS request from disallowed origin: ${origin}`);
        cb(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true
  } as CorsOptions);

  // await app.register(require('@fastify/cors'), {
  //   origin: '*',
  //   credentials: true,
  // });
  
  await app.register(require('@fastify/helmet'));
}

// Load routes
async function loadRoutes(): Promise<void> {
  await app.register(require('./routes/stock'), { prefix: '/api/stock' });
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
    await grpcServer.start();
    // Start HTTP server
    const port = parseInt(process.env.HTTP_PORT || '3003');
    await app.listen({ port, host: '0.0.0.0' });

    const io=setupWebSocket(app);
    await createKafkaConsumer(io);
    
    console.log(`Stock service HTTP server running on port ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();