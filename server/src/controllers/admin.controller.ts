
import { Request, Response } from 'express';
import prisma from '../config/database.js';

// ==========================================
// HELPER: VALIDATE DRIVER ID
// ==========================================

const getDriverId = (
  value: string | string[] | undefined
): string | null => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  return value.trim();
};

// ==========================================
// GET ALL PENDING DRIVERS
// ==========================================

export const getPendingDrivers = async (
  req: Request,
  res: Response
) => {
  try {
    const drivers = await prisma.driver.findMany({
      where: {
        isApproved: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true
          }
        },
        vehicles: true
      },
      orderBy: {
        user: {
          createdAt: 'desc'
        }
      }
    });

    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });

  } catch (error) {
    console.error('Get pending drivers error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch pending drivers.'
    });
  }
};

// ==========================================
// APPROVE DRIVER
// ==========================================

export const approveDriver = async (
  req: Request,
  res: Response
) => {
  try {
    const driverId = getDriverId(req.params.driverId);

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: 'Valid driver ID is required.'
      });
    }

    const driver = await prisma.driver.findUnique({
      where: {
        id: driverId
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.'
      });
    }

    if (driver.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Driver is already approved.'
      });
    }

    const updatedDriver = await prisma.driver.update({
      where: {
        id: driverId
      },
      data: {
        isApproved: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        vehicles: true
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Driver approved successfully.',
      data: updatedDriver
    });

  } catch (error) {
    console.error('Approve driver error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to approve driver.'
    });
  }
};

// ==========================================
// REJECT DRIVER
// ==========================================

export const rejectDriver = async (
  req: Request,
  res: Response
) => {
  try {
    const driverId = getDriverId(req.params.driverId);

    if (!driverId) {
      return res.status(400).json({
        success: false,
        message: 'Valid driver ID is required.'
      });
    }

    const driver = await prisma.driver.findUnique({
      where: {
        id: driverId
      }
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found.'
      });
    }

    if (driver.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Approved drivers cannot be rejected.'
      });
    }

    await prisma.user.delete({
      where: {
        id: driver.userId
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Driver registration rejected successfully.'
    });

  } catch (error) {
    console.error('Reject driver error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to reject driver.'
    });
  }
};
