
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: 'STUDENT' | 'DRIVER' | 'ADMIN';
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : undefined;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication token required.'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Authentication configuration error.'
      });
    }

    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === 'string' ||
      typeof decoded.userId !== 'string' ||
      !['STUDENT', 'DRIVER', 'ADMIN'].includes(decoded.role as string)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role as 'STUDENT' | 'DRIVER' | 'ADMIN'
    };

    next();

  } catch {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};
