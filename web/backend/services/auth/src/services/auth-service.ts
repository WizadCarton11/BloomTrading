import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, User } from '@prisma/client';
import { RegisterData, LoginData, AuthResponse, TokenPair, TokenValidation } from '../types/auth.types';
import * as AuthErrors from '../errors/index';
import { bindAllMethods } from '../utils/bind-all-methods';
import i18next from 'i18next';
import { createBankAccount } from '../grpc-client';

const prisma = new PrismaClient();
class AuthService {
  async register({ email, password, firstName, lastName }: RegisterData): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        console.log('User already exists with this email');
        throw new AuthErrors.EmailAlreadyExistsError(email, { langKey: 'user.register.emailExists' });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName
        }
      });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(user.id, email);
      createBankAccount(user.id);
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          createdAt: user.createdAt
        },
        accessToken,
        refreshToken
      };
    } catch (error: any) {
      // console.error('Registration Service error:', error);
      throw error;
    }
  }

  async login({ email, password }: LoginData): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AuthErrors.UserNotFoundError(email, { langKey: 'user.login.userNotFound' });
    }

    if (!user.isActive) {
      throw new AuthErrors.AccountDisabledError(user.id);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthErrors.InvalidCredentialsError({ langKey: 'user.login.invalidCredentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      accessToken,
      refreshToken
    };
  }

  async generateTokens(userId: string, email: string): Promise<TokenPair> {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new AuthErrors.ValidationError('JWT_SECRET environment variable is not set');
    }

    const accessToken = jwt.sign(
      { userId, email },
      jwtSecret,
      { expiresIn: '15m' }
    );

    const refreshTokenValue = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId,
        expiresAt,
      }
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue
    };
  }

  async generateAccessToken(userId: string, email: string): Promise<string> {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AuthErrors.ValidationError('JWT_SECRET environment variable is not set');
    }
    return jwt.sign(
      { userId, email },
      jwtSecret,
      { expiresIn: '15m' } // 15 minutes
    );
  }

  async validateRefreshToken(refreshToken: string): Promise<TokenPair> {
    // Find refresh token
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    if (!tokenRecord) {
      throw new AuthErrors.InvalidRefreshTokenError({ langKey: 'user.refresh.tokenNotFound' });
    }

    if (new Date() > tokenRecord.expiresAt ) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { token: refreshToken }
      });
      throw new AuthErrors.InvalidRefreshTokenError({ langKey: 'user.refresh.tokenExpired' });
    }

    // Generate new token
    const accessToken = 
      await this.generateAccessToken(tokenRecord.userId, tokenRecord.user.email);

    // Delete old refresh token
    // await prisma.refreshToken.delete({
    //   where: { token: refreshToken }
    // });

    return {
      accessToken,
      refreshToken: refreshToken
    };
  }

  async validateToken(accessToken: string, refreshToken: string): Promise<TokenValidation> {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new AuthErrors.ValidationError('JWT_SECRET environment variable is not set');
      }
      let decoded : { userId: string , email: string };
      try {
        // throw new Error('Simulated error for testing purposes'); // Simulate an error to test refresh token logic
        decoded = jwt.verify(accessToken, jwtSecret) as { userId: string , email: string };

      } catch (error) {
        const tokens = await this.validateRefreshToken(refreshToken);
        accessToken = tokens.accessToken;
        decoded = jwt.verify(tokens.accessToken, jwtSecret) as { userId: string , email: string };
      }
      // const user = await this.getUserById(decoded.userId);
      return {
        valid: true,
        user_id: decoded.userId,
        email: decoded.email,
        accessToken: accessToken,
      };
    } catch (error: any) {
      return {
        valid: false,
        user_id: '',
        email: '',
        error: error.message
      };
    }
  }

  async getUserById(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AuthErrors.UserNotFoundError(userId, { langKey: 'user.get.userNotFound' });
    }

    return user;
  }
}

// const authServiceInstance = new AuthService();

// export const register = authServiceInstance.register.bind(authServiceInstance);
// export const login = authServiceInstance.login.bind(authServiceInstance);
// export const generateTokens = authServiceInstance.generateTokens.bind(authServiceInstance);
// export const refreshToken = authServiceInstance.refreshToken.bind(authServiceInstance);
// export const validateToken = authServiceInstance.validateToken.bind(authServiceInstance);
// export const getUserById = authServiceInstance.getUserById.bind(authServiceInstance);



const authServiceInstance = new AuthService();
export const {
  register,
  login,
  generateTokens,
  validateRefreshToken,
  validateToken,
  getUserById,
} = bindAllMethods(authServiceInstance);