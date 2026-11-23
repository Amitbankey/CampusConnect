
import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';

// ==========================================
// CREATE RIDE VALIDATION
// ==========================================

const createRideSchema = z.object({
  pickup: z.string().trim().min(2, 'Pickup location is required'),
  destination: z.string().trim().min(2, 'Destination is required'),
  departureTime: z.string().datetime({
    message: 'Enter a valid departure date and time'
  }),
  totalSeats: z.number().int().min(1).max(7),
  fare: z.number().positive('Fare must be greater than zero')
});

// ==========================================
// CREATE RIDE
// ==========================================

export const createRide = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const validation = createRideSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ride details.',
        errors: validation.error.flatten()
      });
    }

    const {
      pickup,
      destination,
      departureTime,
      totalSeats,
      fare
    } = validation.data;

    const departureDate = new Date(departureTime);

    if (departureDate <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Departure time must be in the future.'
      });
    }

    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.userId
      },
      include: {
        vehicles: true
      }
    });

    if (!driver || !driver.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Only approved drivers can create rides.'
      });
    }

    const vehicle = driver.vehicles.find(
      (item) => item.capacity >= totalSeats
    );

    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: 'No registered vehicle has enough passenger capacity.'
      });
    }

    const ride = await prisma.ride.create({
      data: {
        driverId: driver.id,
        vehicleId: vehicle.id,
        pickup,
        destination,
        departureTime: departureDate,
        totalSeats,
        availableSeats: totalSeats,
        fare,
        status: 'AVAILABLE'
      },
      include: {
        vehicle: true,
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Ride created successfully.',
      data: ride
    });

  } catch (error) {
    console.error('Create ride error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to create ride.'
    });
  }
};

// ==========================================
// SEARCH AVAILABLE RIDES
// ==========================================

export const getAvailableRides = async (req: Request, res: Response) => {
  try {
    const pickup =
      typeof req.query.pickup === 'string'
        ? req.query.pickup.trim()
        : '';

    const destination =
      typeof req.query.destination === 'string'
        ? req.query.destination.trim()
        : '';

    const vehicleType = req.query.vehicleType;

    if (
      vehicleType !== undefined &&
      vehicleType !== 'AUTO' &&
      vehicleType !== 'CAB'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle type must be AUTO or CAB.'
      });
    }

    const rides = await prisma.ride.findMany({
      where: {
        status: 'AVAILABLE',
        availableSeats: {
          gt: 0
        },
        departureTime: {
          gte: new Date()
        },

        ...(pickup && {
          pickup: {
            contains: pickup,
            mode: 'insensitive'
          }
        }),

        ...(destination && {
          destination: {
            contains: destination,
            mode: 'insensitive'
          }
        }),

        ...(vehicleType && {
          vehicle: {
            vehicleType: vehicleType as 'AUTO' | 'CAB'
          }
        })
      },

      include: {
        vehicle: true,
        driver: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
          }
        }
      },

      orderBy: {
        departureTime: 'asc'
      }
    });

    return res.status(200).json({
      success: true,
      count: rides.length,
      data: rides
    });

  } catch (error) {
    console.error('Search rides error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch available rides.'
    });
  }
};
