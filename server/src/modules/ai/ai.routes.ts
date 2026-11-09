import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { Role } from '../../types/models.js';

const router = Router();

// All AI admin endpoints require authenticated ADMIN
router.use(authenticate, requireRole(Role.ADMIN));

router.post('/scheme-summary/:schemeId', aiController.generateSummary);
router.get('/reviews', aiController.listReviews);
router.patch('/reviews/:id', aiController.updateDraft);
router.post('/reviews/:id/approve', aiController.approveReview);
router.post('/reviews/:id/reject', aiController.rejectReview);

export default router;

