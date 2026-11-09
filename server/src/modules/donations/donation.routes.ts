import { Router } from 'express';
import { donationController } from './donation.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { createDonationSchema } from './donation.validator.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { Role } from '../../types/models.js';

export const donationRouter = Router();
export const adminDonationRouter = Router();

// Public / Visitor / Donor routes
donationRouter.post('/', optionalAuthenticate, validate(createDonationSchema), donationController.createDonation);
donationRouter.get('/me', authenticate, donationController.getMyDonations);
donationRouter.get('/:id', optionalAuthenticate, donationController.getDonationById);

// Admin routes
adminDonationRouter.use(authenticate, requireRole(Role.ADMIN));
adminDonationRouter.get('/', donationController.listAllAdmin);

