import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Session, User } from '../models/index.js';
import { connectToDatabase } from '../core/db.js';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.session;
  if (!token) return res.error(401, 'Unauthorized');

  try {
    await connectToDatabase();
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    
    // Validate session if not admin override
    if (!decoded.admin) {
      const session = await Session.findById(decoded.sessionId);
      if (!session || session.status !== 'active') {
        return res.error(401, 'Session invalid or expired');
      }
      
      // Update last seen (best effort)
      session.lastSeen = new Date();
      session.save().catch(() => {});
    }

    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.error(403, 'Invalid token');
  }
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (user.admin) return next();
    
    const userRecord = await User.findById(user.userId);
    if (!userRecord || userRecord.role !== 'admin') {
      return res.error(403, 'Admin privileges required');
    }
    
    next();
  } catch (err) {
    return res.error(403, 'Admin privileges required');
  }
};
