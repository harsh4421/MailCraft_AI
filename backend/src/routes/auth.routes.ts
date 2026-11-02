import { Router } from 'express';
import { register, login, getMe, logout, registerSchema, loginSchema } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateJwt } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticateJwt, getMe);

export default router;
