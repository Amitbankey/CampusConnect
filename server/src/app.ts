import adminRoutes from './routes/admin.routes.js';
import { requireApprovedDriver } from './middleware/driver.middleware.js';
import { authenticateToken } from './middleware/auth.middleware.js';
import { authorizeRoles } from './middleware/role.middleware.js';
import authRoutes from './routes/auth.routes.js';
import express from 'express';
import cors from 'cors';
import prisma from './config/database.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Welcome API
app.get('/', (req, res) => {
  res.send('Welcome to CampusConnect Backend!');
});

// Health check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusConnect API is running!',
    timestamp: new Date().toISOString()
  });
});

// Database health API
app.get('/api/db-health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: 'CampusConnect database connected successfully!'
    });
  } catch (error) {
    console.error('Database connection failed:', error);

    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});
// Protected test route
app.get(
  '/api/protected',
  authenticateToken,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'You have accessed a protected route!',
      user: req.user
    });
  }
);

// Student-only test route
app.get(
  '/api/student/dashboard',
  authenticateToken,
  authorizeRoles('STUDENT'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Welcome to the Student Dashboard!',
      user: req.user
    });
  }
);
// Approved driver-only test route
app.get(
  '/api/driver/dashboard',
  authenticateToken,
  requireApprovedDriver,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Welcome to the Approved Driver Dashboard!',
      user: req.user
    });
  }
);

export default app;
