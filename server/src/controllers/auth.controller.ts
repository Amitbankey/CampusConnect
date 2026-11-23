
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/database.js';

// ==========================================
// STUDENT REGISTRATION VALIDATION
// ==========================================

const studentSchema = z.object({
  name: z.string().min(2, 'Name must contain at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must contain 10 digits'),
  password: z.string().min(8, 'Password must contain at least 8 characters'),
  college: z.string().min(2, 'College name is required'),
  studentId: z.string().min(2, 'Student ID is required')
});

// ==========================================
// DRIVER REGISTRATION VALIDATION
// ==========================================

const driverSchema = z.object({
  name: z.string().min(2, 'Name must contain at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must contain 10 digits'),
  password: z.string().min(8, 'Password must contain at least 8 characters'),
  licenseNumber: z.string().min(5, 'Valid licence number is required'),
  vehicleNumber: z.string().min(5, 'Valid vehicle number is required'),
  vehicleType: z.enum([ 'AUTO', 'CAB']),
  capacity: z.number().int().min(1).max(7)
});

// ==========================================
// STUDENT REGISTRATION
// ==========================================

export const registerStudent = async (req: Request, res: Response) => {
  try {
    const validation = studentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration details',
        errors: validation.error.flatten()
      });
    }

    const {
      name,
      email,
      phone,
      password,
      college,
      studentId
    } = validation.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email or phone number is already registered'
      });
    }

    const existingStudent = await prisma.student.findUnique({
      where: { studentId }
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: 'Student ID is already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'STUDENT',
        student: {
          create: {
            college,
            studentId
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        student: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: student
    });

  } catch (error) {
    console.error('Student registration error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==========================================
// DRIVER REGISTRATION
// ==========================================

export const registerDriver = async (req: Request, res: Response) => {
  try {
    const validation = driverSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid driver registration details',
        errors: validation.error.flatten()
      });
    }

    const {
      name,
      email,
      phone,
      password,
      licenseNumber,
      vehicleNumber,
      vehicleType,
      capacity
    } = validation.data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email or phone number is already registered'
      });
    }

    const existingDriver = await prisma.driver.findUnique({
      where: { licenseNumber }
    });

    if (existingDriver) {
      return res.status(409).json({
        success: false,
        message: 'Driving licence is already registered'
      });
    }

    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vehicleNumber }
    });

    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: 'Vehicle number is already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const driver = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'DRIVER',
        driver: {
          create: {
            licenseNumber,
            vehicles: {
              create: {
                vehicleNumber,
                vehicleType,
                capacity
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        driver: {
          include: {
            vehicles: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Driver registered successfully. Awaiting admin approval.',
      data: driver
    });

  } catch (error) {
    console.error('Driver registration error:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ==========================================
// USER LOGIN VALIDATION
// ==========================================

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

// ==========================================
// USER LOGIN WITH JWT AUTHENTICATION
// ==========================================

export const loginUser = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password format',
        errors: validation.error.flatten()
      });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        driver: {
          include: {
            vehicles: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      jwtSecret,
      {
        expiresIn: '1d'
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        student: user.student,
        driver: user.driver
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    return res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
};
