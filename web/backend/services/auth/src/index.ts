import 'dotenv/config';
import fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as grpcServer from './grpc-server';
import pino from 'pino';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { CustomError } from './errors/custom.error';
import Redis from 'ioredis';
import { RateLimitOptions, RateLimitErrorContext } from './index.interface';
import i18next from 'i18next';
import { initI18n } from './i18';
import '@fastify/cookie';
import path from 'path';

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

// Register
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

async function loadPlugins(): Promise<void> {
  interface CorsOriginCallback {
    (error: Error | null, allow: boolean): void;
  }

  interface CorsOptions {
    origin: (origin: string | undefined, cb: CorsOriginCallback) => void;
    credentials: boolean;
  }

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
  allowList: ['*'], // Allow local requests without rate limiting
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
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
  if (error instanceof CustomError) {
    const response: any = {
      statusCode: error.statusCode,
      error: error.code,

      message: t(error.metadata.langKey),
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



async function loadRoutes(): Promise<void> {
  await app.register(require('./routes/auth'), { prefix: '/api/auth' });
}

app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
  const lang = request.headers['x-lang'] || 'en';
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