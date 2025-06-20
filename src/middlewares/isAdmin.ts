import { Request, Response, NextFunction } from 'express';
import Admin from '../models/Admin';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const admin = await Admin.findByPk(req.user.id);
    
    if (!admin) {
      res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Error checking admin privileges' });
  }
}; 