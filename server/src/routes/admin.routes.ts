
import { Router } from 'express';
import {
  getPendingDrivers,
  approveDriver,
  rejectDriver
} from '../controllers/admin.controller.js';

import { authenticateToken } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticateToken, authorizeRoles('ADMIN'));

// Get all pending drivers
router.get('/pending-drivers', getPendingDrivers);

// Approve a driver
router.patch('/drivers/:driverId/approve', approveDriver);

// Reject a driver
router.delete('/drivers/:driverId/reject', rejectDriver);

export default router;
