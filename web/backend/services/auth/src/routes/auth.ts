import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import * as authService from '../services/auth-service';
import { 
  RegisterBody, 
  LoginBody, 
  RefreshBody, 
  AuthenticatedRequest,
  UserResponse 
} from '../types';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema 
} from '../schemas';
import { 
  validateBody, 
  authenticateToken, 
} from '../middleware';

async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // Register user
  fastify.post('/register', {
    preHandler: validateBody(registerSchema)
  }, async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) => {
    try {
      const { email, password, firstName, lastName } = request.body;

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName
      });
      console.log('Registration result:', result);

      reply.code(201).send(result);
    } catch (error: any) {
      console.error('Registration route error:', error);
      return error;
    }
  });

  // Login user
  fastify.post('/login', {
    preHandler: validateBody(loginSchema)
  }, async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    try {
      const { email, password } = request.body;

      const result = await authService.login({ email, password });
      reply.send(result);
    } catch (error: any) {
      console.error('Login route error:', error);
      return error;
    }
  });

  // Refresh token
  fastify.post('/refresh', {
    preHandler: validateBody(refreshTokenSchema)
  }, async (request: FastifyRequest<{ Body: RefreshBody }>, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body;

      const result = await authService.validateRefreshToken(refreshToken);
      reply.send(result);
    } catch (error: any) {
      console.error('Refresh token route error:', error);
      return error;
    }
  });

  // Get current user
  fastify.get('/me', {
    preHandler: authenticateToken
  }, async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      if (!request.userId) {
        return reply.code(401).send({ error: 'User ID not found' });
      }

      const user = await authService.getUserById(request.userId);
      const userResponse: UserResponse = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt
      };
      
      reply.send(userResponse);
    } catch (error: any) {
      console.error('Get current user route error:', error);
      return error;
    }
  });
}

export = authRoutes;