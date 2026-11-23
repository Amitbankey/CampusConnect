
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';

export const requireApprovedDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (req.user.role !== 'DRIVER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Driver account required.'
      });
    }

    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.userId
      },
      select: {
        id: true,
        isApproved: true
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found.'
      });
    }

    if (!driver.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your driver account is awaiting admin approval.'
      });
    }

    next();

  } catch (error) {
    console.error('Driver approval middleware error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to verify driver approval status.'
    });
  }
};
