import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateSettings,
  changePassword,
  getAIStatus,
  updateProfileSchema,
  updateSettingsSchema,
  changePasswordSchema,
  testApiKey,
} from '../controllers/user.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateJwt, optionalJwt } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticateJwt, getProfile);
router.put('/profile', authenticateJwt, validateRequest(updateProfileSchema), updateProfile);
router.put('/settings', authenticateJwt, validateRequest(updateSettingsSchema), updateSettings);
router.put('/password', authenticateJwt, validateRequest(changePasswordSchema), changePassword);
router.get('/ai-status', optionalJwt, getAIStatus);
router.post('/test-api-key', authenticateJwt, testApiKey);

export default router;
