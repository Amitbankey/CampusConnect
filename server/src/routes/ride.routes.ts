import { Router } from 'express';
import {
  createRide,
  getAvailableRides,
  getMyRides,
} from '../controllers/ride.controller.js';

import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { requireApprovedDriver } from '../middleware/driver.middleware.js';

const router = Router();

// All ride requests require authentication
router.use(authenticateToken);

// Students can search available rides
router.get(
  '/',
  authorizeRoles('STUDENT'),
  getAvailableRides
);

// Drivers can view their own rides
router.get(
  '/my-rides',
  requireApprovedDriver,
  getMyRides
);

// Only approved drivers can create rides
router.post(
  '/create',
  requireApprovedDriver,
  createRide
);

export default router;