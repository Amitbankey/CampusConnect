
import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database.js';

const bookingSchema = z.object({
  rideId: z.string().uuid(),
  seatsBooked: z.number().int().min(1).max(7).default(1),
});

export const createBooking = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const validation = bookingSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking details.',
        errors: validation.error.flatten(),
      });
    }

    const { rideId, seatsBooked } = validation.data;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Find the student associated with the logged-in user
    const student = await prisma.student.findUnique({
      where: {
        userId: req.user.userId,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    // Reserve seats and create or reuse the booking in one transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Check whether this student already has a booking for this ride
      const existingBooking = await tx.booking.findUnique({
        where: {
          rideId_studentId: {
            rideId,
            studentId: student.id,
          },
        },
      });

      // Only CANCELLED or REJECTED bookings can be booked again
      if (
        existingBooking &&
        existingBooking.status !== 'CANCELLED' &&
        existingBooking.status !== 'REJECTED'
      ) {
        throw new Error('DUPLICATE_BOOKING');
      }

      // Check that the ride exists
      const ride = await tx.ride.findUnique({
        where: { id: rideId },
        select: {
          id: true,
          status: true,
          departureTime: true,
        },
      });

      if (!ride) {
        throw new Error('RIDE_NOT_FOUND');
      }

      if (
        ride.status !== 'AVAILABLE' ||
        ride.departureTime <= new Date()
      ) {
        throw new Error('RIDE_NOT_AVAILABLE');
      }

      // Atomically reserve the requested seats
      const seatUpdate = await tx.ride.updateMany({
        where: {
          id: rideId,
          status: 'AVAILABLE',
          departureTime: {
            gt: new Date(),
          },
          availableSeats: {
            gte: seatsBooked,
          },
        },
        data: {
          availableSeats: {
            decrement: seatsBooked,
          },
        },
      });

      if (seatUpdate.count !== 1) {
        throw new Error('INSUFFICIENT_SEATS');
      }

      // Mark the ride FULL if no seats remain
      const updatedRide = await tx.ride.findUnique({
        where: { id: rideId },
        select: {
          availableSeats: true,
        },
      });

      if (updatedRide?.availableSeats === 0) {
        await tx.ride.update({
          where: { id: rideId },
          data: {
            status: 'FULL',
          },
        });
      }

      // Reuse the previous booking if it was cancelled or rejected
      if (existingBooking) {
        const rebooked = await tx.booking.updateMany({
          where: {
            id: existingBooking.id,
            status: {
              in: ['CANCELLED', 'REJECTED'],
            },
          },
          data: {
            seatsBooked,
            status: 'PENDING',
            createdAt: new Date(),
          },
        });

        if (rebooked.count !== 1) {
          throw new Error('BOOKING_ALREADY_PROCESSED');
        }

        return tx.booking.findUnique({
          where: {
            id: existingBooking.id,
          },
          include: {
            ride: {
              include: {
                vehicle: true,
                driver: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }

      // Create a new booking if no previous booking exists
      return tx.booking.create({
        data: {
          rideId,
          studentId: student.id,
          seatsBooked,
          status: 'PENDING',
        },
        include: {
          ride: {
            include: {
              vehicle: true,
              driver: {
                include: {
                  user: {
                    select: {
                      name: true,
                      phone: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    return res.status(201).json({
      success: true,
      message:
        'Ride booked successfully. Your seats are reserved pending driver approval.',
      data: booking,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';

    if (message === 'DUPLICATE_BOOKING') {
      return res.status(409).json({
        success: false,
        message: 'You have already booked this ride.',
      });
    }

    if (message === 'RIDE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Ride not found.',
      });
    }

    if (message === 'RIDE_NOT_AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: 'This ride is no longer available for booking.',
      });
    }

    if (message === 'INSUFFICIENT_SEATS') {
      return res.status(409).json({
        success: false,
        message: 'Not enough seats are available.',
      });
    }

    if (message === 'BOOKING_ALREADY_PROCESSED') {
      return res.status(409).json({
        success: false,
        message: 'This booking has already been processed. Please try again.',
      });
    }

    // Handle a possible duplicate booking race condition
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    ) {
      return res.status(409).json({
        success: false,
        message: 'You have already booked this ride.',
      });
    }

    console.error('Create booking error:', error);

    return res.status(500).json({
      success: false,
      message: 'Something went wrong while booking the ride.',
    });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const student = await prisma.student.findUnique({
      where: {
        userId: req.user.userId,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        studentId: student.id,
      },
      include: {
        ride: {
          include: {
            vehicle: true,
            driver: {
              include: {
                user: {
                  select: {
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });

  } catch (error) {
    console.error('Get student bookings error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch your bookings.',
    });
  }
};

export const getDriverBookingRequests = async (
  req: Request,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.userId,
      },
      select: {
        id: true,
        isApproved: true,
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found.',
      });
    }

    if (!driver.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your driver account is not approved yet.',
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING',
        ride: {
          driverId: driver.id,
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        ride: {
          include: {
            vehicle: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });

  } catch (error) {
    console.error('Get driver booking requests error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch booking requests.',
    });
  }
};

export const acceptBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const bookingId = req.params.bookingId;

    if (typeof bookingId !== 'string' || !bookingId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Valid booking ID is required.',
      });
    }

    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.userId,
      },
      select: {
        id: true,
        isApproved: true,
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found.',
      });
    }

    if (!driver.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your driver account is not approved.',
      });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const existingBooking = await tx.booking.findFirst({
        where: {
          id: bookingId,
          ride: {
            driverId: driver.id,
          },
        },
      });

      if (!existingBooking) {
        throw new Error('BOOKING_NOT_FOUND');
      }

      if (existingBooking.status !== 'PENDING') {
        throw new Error('BOOKING_NOT_PENDING');
      }

      const result = await tx.booking.updateMany({
        where: {
          id: bookingId,
          status: 'PENDING',
          ride: {
            driverId: driver.id,
          },
        },
        data: {
          status: 'ACCEPTED',
        },
      });

      if (result.count !== 1) {
        throw new Error('BOOKING_NOT_PENDING');
      }

      return tx.booking.findUnique({
        where: {
          id: bookingId,
        },
        include: {
          ride: true,
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Booking accepted successfully.',
      data: booking,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message === 'BOOKING_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found for this driver.',
      });
    }

    if (message === 'BOOKING_NOT_PENDING') {
      return res.status(409).json({
        success: false,
        message: 'This booking has already been processed.',
      });
    }

    console.error('Accept booking error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to accept booking.',
    });
  }
};

export const rejectBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const bookingId = req.params.bookingId;

    if (typeof bookingId !== 'string' || !bookingId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Valid booking ID is required.',
      });
    }

    const driver = await prisma.driver.findUnique({
      where: {
        userId: req.user.userId,
      },
      select: {
        id: true,
        isApproved: true,
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver profile not found.',
      });
    }

    if (!driver.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your driver account is not approved.',
      });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const existingBooking = await tx.booking.findFirst({
        where: {
          id: bookingId,
          ride: {
            driverId: driver.id,
          },
        },
      });

      if (!existingBooking) {
        throw new Error('BOOKING_NOT_FOUND');
      }

      if (existingBooking.status !== 'PENDING') {
        throw new Error('BOOKING_NOT_PENDING');
      }

      // Change status only if it is still pending
      const result = await tx.booking.updateMany({
        where: {
          id: bookingId,
          status: 'PENDING',
          ride: {
            driverId: driver.id,
          },
        },
        data: {
          status: 'REJECTED',
        },
      });

      if (result.count !== 1) {
        throw new Error('BOOKING_NOT_PENDING');
      }

      // Restore the seats reserved by this booking
      const updatedRide = await tx.ride.update({
        where: {
          id: existingBooking.rideId,
        },
        data: {
          availableSeats: {
            increment: existingBooking.seatsBooked,
          },
        },
        select: {
          id: true,
          availableSeats: true,
          totalSeats: true,
        },
      });

      // Reopen the ride if seats are available again
      if (updatedRide.availableSeats > 0) {
        await tx.ride.update({
          where: {
            id: updatedRide.id,
          },
          data: {
            status: 'AVAILABLE',
          },
        });
      }

      return tx.booking.findUnique({
        where: {
          id: bookingId,
        },
        include: {
          ride: true,
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  phone: true,
                },
              },
            },
          },
        },
      });
    });

    return res.status(200).json({
      success: true,
      message:
        'Booking rejected successfully. Reserved seats have been restored.',
      data: booking,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message === 'BOOKING_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found for this driver.',
      });
    }

    if (message === 'BOOKING_NOT_PENDING') {
      return res.status(409).json({
        success: false,
        message: 'This booking has already been processed.',
      });
    }

    console.error('Reject booking error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to reject booking.',
    });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const bookingId = req.params.bookingId;

    if (typeof bookingId !== 'string' || !bookingId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Valid booking ID is required.',
      });
    }

    const student = await prisma.student.findUnique({
      where: {
        userId: req.user.userId,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    const booking = await prisma.$transaction(async (tx) => {
      const existingBooking = await tx.booking.findFirst({
        where: {
          id: bookingId,
          studentId: student.id,
        },
        include: {
          ride: {
            select: {
              id: true,
              status: true,
              departureTime: true,
              totalSeats: true,
            },
          },
        },
      });

      if (!existingBooking) {
        throw new Error('BOOKING_NOT_FOUND');
      }

      if (
        existingBooking.status !== 'PENDING' &&
        existingBooking.status !== 'ACCEPTED'
      ) {
        throw new Error('BOOKING_NOT_CANCELLABLE');
      }

      if (existingBooking.ride.departureTime <= new Date()) {
        throw new Error('RIDE_ALREADY_STARTED');
      }

      // Change the booking status only once
      const result = await tx.booking.updateMany({
        where: {
          id: bookingId,
          studentId: student.id,
          status: {
            in: ['PENDING', 'ACCEPTED'],
          },
        },
        data: {
          status: 'CANCELLED',
        },
      });

      if (result.count !== 1) {
        throw new Error('BOOKING_NOT_CANCELLABLE');
      }

      // Restore the seats reserved by this booking
      const updatedRide = await tx.ride.update({
        where: {
          id: existingBooking.rideId,
        },
        data: {
          availableSeats: {
            increment: existingBooking.seatsBooked,
          },
        },
        select: {
          id: true,
          status: true,
          availableSeats: true,
          totalSeats: true,
        },
      });

      if (updatedRide.availableSeats > updatedRide.totalSeats) {
        throw new Error('SEAT_COUNT_ERROR');
      }

      // Reopen a full ride when seats become available
      if (
        updatedRide.availableSeats > 0 &&
        ['AVAILABLE', 'FULL'].includes(updatedRide.status)
      ) {
        await tx.ride.update({
          where: {
            id: updatedRide.id,
          },
          data: {
            status: 'AVAILABLE',
          },
        });
      }

      return tx.booking.findUnique({
        where: {
          id: bookingId,
        },
        include: {
          ride: true,
        },
      });
    });

    return res.status(200).json({
      success: true,
      message:
        'Booking cancelled successfully. Reserved seats have been restored.',
      data: booking,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message === 'BOOKING_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (message === 'BOOKING_NOT_CANCELLABLE') {
      return res.status(409).json({
        success: false,
        message: 'This booking has already been processed or cancelled.',
      });
    }

    if (message === 'RIDE_ALREADY_STARTED') {
      return res.status(400).json({
        success: false,
        message:
          'You cannot cancel a booking after the ride has started.',
      });
    }

    if (message === 'SEAT_COUNT_ERROR') {
      return res.status(409).json({
        success: false,
        message: 'Seat restoration conflict. Please contact support.',
      });
    }

    console.error('Cancel booking error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to cancel booking.',
    });
  }
};
