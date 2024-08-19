import authRoutes from './routes/authRoutes';
import { Router } from 'express';
import { login, register } from '../controllers/authController';  // Assuming these functions exist

const router = Router();

// Define authentication routes
router.post('/login', login);
router.post('/register', register);

export default router;