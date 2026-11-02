import { Router } from 'express';
import {
  generateDraft,
  refineDraft,
  saveDraft,
  getDrafts,
  getDraftById,
  updateDraft,
  deleteDraft,
  getGenerations,
  draftSchema,
  refineSchema,
  saveDraftSchema,
  updateDraftSchema,
} from '../controllers/email.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { authenticateJwt, optionalJwt } from '../middleware/auth.middleware';

const router = Router();

// Generation & Refinement
router.post('/draft', optionalJwt, validateRequest(draftSchema), generateDraft);
router.post('/refine', optionalJwt, validateRequest(refineSchema), refineDraft);

// Saved Drafts CRUD
router.post('/save', authenticateJwt, validateRequest(saveDraftSchema), saveDraft);
router.get('/drafts', authenticateJwt, getDrafts);
router.get('/generations', authenticateJwt, getGenerations);
router.get('/:id', authenticateJwt, getDraftById);
router.put('/:id', authenticateJwt, validateRequest(updateDraftSchema), updateDraft);
router.delete('/:id', authenticateJwt, deleteDraft);

export default router;
