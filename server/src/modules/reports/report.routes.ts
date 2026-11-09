import { Router } from 'express';
import { reportController } from './report.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { Role } from '../../types/models.js';

const router = Router();

router.use(authenticate, requireRole(Role.ADMIN));

router.get('/dashboard', reportController.getDashboard);
router.get('/reports/campaigns', reportController.getCampaignsReport);
router.get('/reports/form-10bd', reportController.getForm10BD);

export default router;

