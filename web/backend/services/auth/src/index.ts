import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';
import * as grpcServer from './grpc-server';

const app: FastifyInstance = fastify({ logger: true });

// Load plugins
async function loadPlugins(): Promise<void> {
  await app.register(require('@fastify/cors'), {
    origin: true
  });
  
  await app.register(require('@fastify/helmet'));
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