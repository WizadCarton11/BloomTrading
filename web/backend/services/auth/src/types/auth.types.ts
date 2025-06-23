import { FastifyRequest } from 'fastify';

export interface RegisterBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RefreshBody {
  refreshToken: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  userId?: string;
  accessToken?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface TokenValidation {
  valid: boolean;
  user_id: string;
  email: string;
  error?: string;
  accessToken?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}


export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}


