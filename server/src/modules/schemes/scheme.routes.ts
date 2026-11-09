import { Router } from 'express';
import { schemeController } from './scheme.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { listSchemesQuerySchema, createSchemeSchema, updateSchemeSchema, askSchemeQuestionSchema } from './scheme.validator.js';
import { optionalAuthenticate, authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { Role } from '../../types/models.js';

export const publicSchemeRouter = Router();
export const adminSchemeRouter = Router();

// Public routes
publicSchemeRouter.get('/', optionalAuthenticate, validate(listSchemesQuerySchema), schemeController.listSchemes);
publicSchemeRouter.post('/ask', validate(askSchemeQuestionSchema), schemeController.askQuestion);
publicSchemeRouter.get('/:slug', optionalAuthenticate, schemeController.getSchemeBySlug);

// Admin routes
adminSchemeRouter.use(authenticate, requireRole(Role.ADMIN));
adminSchemeRouter.get('/:id', schemeController.getSchemeById);
adminSchemeRouter.post('/', validate(createSchemeSchema), schemeController.createScheme);
adminSchemeRouter.patch('/:id', validate(updateSchemeSchema), schemeController.updateScheme);
adminSchemeRouter.post('/:id/publish', schemeController.publishScheme);
adminSchemeRouter.post('/:id/archive', schemeController.archiveScheme);
adminSchemeRouter.delete('/:id', schemeController.deleteScheme);

