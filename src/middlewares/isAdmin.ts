import { Request, Response, NextFunction } from 'express';
import Admin from '../models/Admin';

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const admin = await Admin.findByPk(req.user.id);
    
    if (!admin) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Error checking admin privileges' });
  }
}; 