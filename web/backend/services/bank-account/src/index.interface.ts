import 'dotenv/config';
import fastify, { FastifyInstance, FastifyRequest } from 'fastify'
import Redis from 'ioredis';
export interface RateLimitErrorContext {
  statusCode: number;
  error: string;
  limit: number;
  remaining: number;
  reset: number;
  ttl: number;
  ban?: boolean;
}

export interface BanOptions {
  duration: number;
  max: number;
  keyGenerator: (request: FastifyRequest) => string;
  redis: Redis;
}

export interface RateLimitOptions {
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