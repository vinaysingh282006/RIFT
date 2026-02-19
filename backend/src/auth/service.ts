import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../database/connection';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'pharmaguard-dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'pharmaguard-refresh-secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateAccessToken(payload: UserPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  }

  static generateRefreshToken(payload: UserPayload): string {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions);
  }

  static verifyAccessToken(token: string): UserPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as UserPayload;
    } catch (error) {
      logger.error('Access token verification failed:', error);
      return null;
    }
  }

  static verifyRefreshToken(token: string): UserPayload | null {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as UserPayload;
    } catch (error) {
      logger.error('Refresh token verification failed:', error);
      return null;
    }
  }

  static async registerUser(email: string, password: string, firstName: string, lastName: string, role: string = 'PATIENT') {
    try {
      // Check if user already exists
      const existingUser = await db.user.findByEmail(email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const user = await db.user.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role
      });

      // Generate tokens
      const payload: UserPayload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      logger.info(`User registered: ${email} (${role})`);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  static async loginUser(email: string, password: string) {
    try {
      // Find user
      const user = await db.user.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await db.user.updateLastLogin(user.id);

      // Generate tokens
      const payload: UserPayload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      logger.info(`User logged in: ${email} (${user.role})`);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      };
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }

  static async refreshTokens(refreshToken: string) {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      if (!payload) {
        throw new Error('Invalid refresh token');
      }

      // Verify user still exists
      const user = await db.user.findById(payload.id);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const newPayload: UserPayload = {
        id: user.id,
        email: user.email,
        role: user.role
      };

      const newAccessToken = this.generateAccessToken(newPayload);
      const newRefreshToken = this.generateRefreshToken(newPayload);

      logger.info(`Tokens refreshed for user: ${user.email}`);
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  static async getUserProfile(userId: string) {
    try {
      const user = await db.user.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at
      };
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      throw error;
    }
  }
}