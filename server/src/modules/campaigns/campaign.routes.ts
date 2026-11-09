import { Router } from 'express';
import { campaignController } from './campaign.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createCampaignSchema, updateCampaignSchema } from './campaign.validator.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { Role } from '../../types/models.js';

export const publicCampaignRouter = Router();
export const adminCampaignRouter = Router();

// Public routes
publicCampaignRouter.get('/', campaignController.listPublic);
publicCampaignRouter.get('/:slug', campaignController.getBySlug);

// Admin routes
adminCampaignRouter.use(authenticate, requireRole(Role.ADMIN));
adminCampaignRouter.get('/', campaignController.listAdmin);
adminCampaignRouter.post('/', validate(createCampaignSchema), campaignController.create);
adminCampaignRouter.patch('/:id', validate(updateCampaignSchema), campaignController.update);

