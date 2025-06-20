import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Admin from '../models/Admin';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

const JWT_SECRET = process.env.JWT_SECRET;

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
        isAdmin?: boolean;
      }
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; isAdmin?: boolean };

    // Check if it's an admin token
    if (decoded.isAdmin) {
      const admin = await Admin.findByPk(decoded.id);

      if (!admin) {
        res.status(401).json({ error: 'Admin not found' });
        return;
      }
      req.user = {
        id: admin.id,
        role: 'admin',
        isAdmin: true
      };
    } else {
      // Regular user token
      const user = await User.findByPk(decoded.id);

      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }
      req.user = {
        id: user.id,
        role: user.role
      };
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}; 