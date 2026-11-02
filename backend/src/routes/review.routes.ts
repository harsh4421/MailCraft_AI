import { Router } from 'express';
import {
  analyzeEmail,
  getReviews,
  getReviewStats,
  getReviewById,
  deleteReview,
  reviewSchema,
} from '../controllers/review.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateJwt, optionalJwt } from '../middleware/auth.middleware';

const router = Router();

router.post('/analyze', optionalJwt, validateRequest(reviewSchema), analyzeEmail);
router.get('/stats', authenticateJwt, getReviewStats);
router.get('/', authenticateJwt, getReviews);
router.get('/:id', authenticateJwt, getReviewById);
router.delete('/:id', authenticateJwt, deleteReview);

export default router;
