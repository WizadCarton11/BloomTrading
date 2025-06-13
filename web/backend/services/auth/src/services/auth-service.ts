import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenValidation {
  valid: boolean;
  user_id: string;
  email: string;
  error?: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: Date;
}

interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async register({ email, password, firstName, lastName }: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
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
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

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

  async login({ email, password }: LoginData): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

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

  async generateTokens(userId: string): Promise<TokenPair> {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const accessToken = jwt.sign(
      { userId },
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
        expiresAt
      }
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    // Find refresh token
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    if (new Date() > tokenRecord.expiresAt) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { token: refreshToken }
      });
      throw new Error('Refresh token expired');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = 
      await this.generateTokens(tokenRecord.userId);

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { token: refreshToken }
    });

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  async validateToken(token: string): Promise<TokenValidation> {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
      }

      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      const user = await this.getUserById(decoded.userId);
      
      return {
        valid: true,
        user_id: user.id,
        email: user.email
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
      throw new Error('User not found');
    }

    return user;
  }
}

const authServiceInstance = new AuthService();

export const register = authServiceInstance.register.bind(authServiceInstance);
export const login = authServiceInstance.login.bind(authServiceInstance);
export const generateTokens = authServiceInstance.generateTokens.bind(authServiceInstance);
export const refreshToken = authServiceInstance.refreshToken.bind(authServiceInstance);
export const validateToken = authServiceInstance.validateToken.bind(authServiceInstance);
export const getUserById = authServiceInstance.getUserById.bind(authServiceInstance);