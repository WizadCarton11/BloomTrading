import 'dotenv/config';
import fastify, { FastifyInstance } from 'fastify';

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
  await app.register(require('./routes/accounts'), { prefix: '/api/accounts' });
}

// Health check
app.get('/health', async (request, reply) => {
  return { status: 'healthy', service: 'bank-account-service' };
});

async function start(): Promise<void> {
  try {
    // Load plugins and routes
    await loadPlugins();
    await loadRoutes();
    
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