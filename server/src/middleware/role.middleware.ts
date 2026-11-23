
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: 'STUDENT' | 'DRIVER' | 'ADMIN';
  };
}

export const authorizeRoles = (
  ...allowedRoles: Array<'STUDENT' | 'DRIVER' | 'ADMIN'>
) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission.'
      });
    }

    next();
  };
};
