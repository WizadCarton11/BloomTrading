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
import i18next from 'i18next';

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
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      reply.code(201).send({ 
        message: t('user.register.success'),
        data: result
      });
    } catch (error: any) {
      console.error('Registration route error:', error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      return {
        message: t(error.metadata.langKey || 'user.register.error'),
        error: error.message || 'An error occurred during registration',
        statusCode: error.statusCode || 500,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        details: error.details || null
      } as any;
    }
  });

  // Login user
  fastify.post('/login', {
    preHandler: validateBody(loginSchema)
  }, async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
    try {
      const { email, password } = request.body;

      const result = await authService.login({ email, password });
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      reply.send({
        message: t('user.login.success'),
        data: result
      });
    } catch (error: any) {
      console.error('Login route error:', error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      return {
        message: t(error.metadata.langKey || 'user.login.error'),
        error: error.message || 'An error occurred during login',
        statusCode: error.statusCode || 500,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        details: error.details || null
      } as any;
    }
  });

  // Refresh token
  fastify.post('/refresh', {
    preHandler: validateBody(refreshTokenSchema)
  }, async (request: FastifyRequest<{ Body: RefreshBody }>, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body;

      const result = await authService.validateRefreshToken(refreshToken);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      reply.send({
        message: t('user.refresh.success'),
        data: result
      });
    } catch (error: any) {
      console.error('Refresh token route error:', error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      return {
        message: t(error.metadata.langKey || 'user.refresh.error'),
        error: error.message || 'An error occurred during token refresh',
        statusCode: error.statusCode || 500,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        details: error.details || null
      } as any;
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
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      reply.send({
        message: t('user.get.success'),
        data: userResponse
      });
    } catch (error: any) {
      console.error('Get current user route error:', error);
      const lang= request.headers['x-lang'] || 'en';
      const t = i18next.getFixedT(lang);
      return {
        message: t(error.metadata.langKey || 'user.get.error'),
        error: error.message || 'An error occurred while fetching user data',
        statusCode: error.statusCode || 500,
        code: error.code || 'INTERNAL_SERVER_ERROR',
        details: error.details || null
      } as any;
    }
  });
}

export = authRoutes;