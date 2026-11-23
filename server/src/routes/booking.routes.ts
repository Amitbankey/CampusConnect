
import { Router } from 'express';

import {
  createBooking,
  getMyBookings,
  getDriverBookingRequests,
  acceptBooking,
  rejectBooking,
  cancelBooking,
} from '../controllers/booking.controller.js';

import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { requireApprovedDriver } from '../middleware/driver.middleware.js';

const router = Router();

// Student routes

// Get student's booking history
router.get(
  '/my-bookings',
  authenticateToken,
  authorizeRoles('STUDENT'),
  getMyBookings
);

// Create a booking
router.post(
  '/',
  authenticateToken,
  authorizeRoles('STUDENT'),
  createBooking
);

// Cancel student's own booking
router.patch(
  '/:bookingId/cancel',
  authenticateToken,
  authorizeRoles('STUDENT'),
  cancelBooking
);

// Driver routes

// Get pending booking requests
router.get(
  '/driver/requests',
  authenticateToken,
  authorizeRoles('DRIVER'),
  requireApprovedDriver,
  getDriverBookingRequests
);

// Accept booking
router.patch(
  '/:bookingId/accept',
  authenticateToken,
  authorizeRoles('DRIVER'),
  requireApprovedDriver,
  acceptBooking
);

// Reject booking
router.patch(
  '/:bookingId/reject',
  authenticateToken,
  authorizeRoles('DRIVER'),
  requireApprovedDriver,
  rejectBooking
);

export default router;
