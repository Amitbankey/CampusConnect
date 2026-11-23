
import { Router } from 'express';
import {
  registerStudent,
  registerDriver,
  loginUser,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register/student', registerStudent);
router.post('/register/driver', registerDriver);
router.post('/login', loginUser);

export default router;
