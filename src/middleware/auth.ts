import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Customer } from '../models';
import { JWT_CONFIG } from '../config/jwt';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
        isAdmin?: boolean;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, JWT_CONFIG.secret) as any;
    const user = await User.findByPk(decoded.id);

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      role: user.role
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  next();
}; 