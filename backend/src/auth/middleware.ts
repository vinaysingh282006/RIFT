import { Request, Response, NextFunction } from 'express';
import { AuthService } from './service';
import { logger } from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = AuthService.verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = payload;
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      logger.error('Role validation error:', error);
      res.status(500).json({ error: 'Role validation failed' });
    }
  };
};

// Helper middleware for specific roles
export const requireClinician = requireRole(['CLINICIAN', 'ADMIN']);
export const requireAdmin = requireRole(['ADMIN']);
export const requirePatient = requireRole(['PATIENT']);

// Optional authentication - sets user if token is valid, but doesn't require it
export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const payload = AuthService.verifyAccessToken(token);
      if (payload) {
        req.user = payload;
      }
    }
    
    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    // Still continue even if token is invalid
    next();
  }
};