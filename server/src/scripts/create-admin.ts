
import 'dotenv/config';
import bcrypt from 'bcrypt';
import prisma from '../config/database.js';

const createAdmin = async () => {
  try {
    const name = process.env.ADMIN_NAME;
    const email = process.env.ADMIN_EMAIL;
    const phone = process.env.ADMIN_PHONE;
    const password = process.env.ADMIN_PASSWORD;

    if (!name || !email || !phone || !password) {
      throw new Error('Admin environment variables are missing.');
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      throw new Error('Admin phone must contain exactly 10 digits.');
    }

    if (password.length < 12) {
      throw new Error('Admin password must contain at least 12 characters.');
    }

    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    });

    if (existingAdmin) {
      throw new Error('An account with this email or phone already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log('Admin account created successfully!');
    console.log(admin);

  } catch (error) {
    console.error('Admin creation failed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();
