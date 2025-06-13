import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as authService from '../services/auth-service';

interface RegisterBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface RefreshBody {
  refreshToken: string;
}

interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
}

async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // Register user
  fastify.post('/register', async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    try {
      const { email, password, firstName, lastName } = request.body;
      
      if (!email || !password) {
        return reply.code(400).send({
          error: 'Email and password are required'
        });
      }

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName
      });

      reply.code(201).send(result);
    } catch (error: any) {
      reply.code(400).send({ error: error.message });
    }
  });

  // Login user
  fastify.post('/login', async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    try {
      const { email, password } = request.body;
      
      if (!email || !password) {
        return reply.code(400).send({
          error: 'Email and password are required'
        });
      }

      const result = await authService.login({ email, password });
      reply.send(result);
    } catch (error: any) {
      reply.code(401).send({ error: error.message });
    }
  });

  // Refresh token
  fastify.post('/refresh', async (request: FastifyRequest<{ Body: RefreshBody }>, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body;
      
      if (!refreshToken) {
        return reply.code(400).send({
          error: 'Refresh token is required'
        });
      }

      const result = await authService.refreshToken(refreshToken);
      reply.send(result);
    } catch (error: any) {
      reply.code(401).send({ error: error.message });
    }
  });

  // Get current user
  fastify.get('/me', {
    preHandler: async (request: AuthenticatedRequest, reply: FastifyReply) => {
      try {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return reply.code(401).send({ error: 'No token provided' });
        }

        const validation = await authService.validateToken(token);
        if (!validation.valid) {
          return reply.code(401).send({ error: 'Invalid token' });
        }

        request.userId = validation.user_id;
      } catch (error: any) {
        reply.code(401).send({ error: 'Invalid token' });
      }
    }
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      if (!request.userId) {
        return reply.code(401).send({ error: 'User ID not found' });
      }

      const user = await authService.getUserById(request.userId);
      reply.send({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt
      });
    } catch (error: any) {
      reply.code(404).send({ error: error.message });
    }
  });
}

export = authRoutes;