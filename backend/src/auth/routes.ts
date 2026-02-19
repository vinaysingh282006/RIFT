import { Router, Request, Response } from 'express';
import { AuthService } from './service';
import { authenticateToken, requireClinician } from './middleware';
import { logger } from '../utils/logger';

export const authRouter = Router();

// Register new user
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await AuthService.registerUser(
      email,
      password,
      firstName,
      lastName,
      role || 'PATIENT'
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
      tokens: result.tokens
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

// Login user
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await AuthService.loginUser(email, password);

    res.status(200).json({
      message: 'Login successful',
      user: result.user,
      tokens: result.tokens
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

// Refresh tokens
authRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const tokens = await AuthService.refreshTokens(refreshToken);

    res.status(200).json({
      message: 'Tokens refreshed successfully',
      tokens
    });
  } catch (error: any) {
    logger.error('Token refresh error:', error);
    res.status(401).json({ error: error.message || 'Token refresh failed' });
  }
});

// Get current user profile
authRouter.get('/me', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const user = await AuthService.getUserProfile(userId);

    res.status(200).json({
      user
    });
  } catch (error: any) {
    logger.error('Get profile error:', error);
    res.status(400).json({ error: error.message || 'Failed to get profile' });
  }
});

// Get all users (clinician only)
authRouter.get('/users', authenticateToken, requireClinician, async (req: any, res: Response) => {
  try {
    // This would fetch all users from database
    // For now, return empty array as we're using mock database
    res.status(200).json({
      users: [],
      count: 0
    });
  } catch (error: any) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});