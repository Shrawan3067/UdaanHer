import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { prisma } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import { publicSchemeRouter, adminSchemeRouter } from './modules/schemes/scheme.routes.js';
import eligibilityRoutes from './modules/eligibility/eligibility.routes.js';
import { publicCampaignRouter, adminCampaignRouter } from './modules/campaigns/campaign.routes.js';
import { donationRouter, adminDonationRouter } from './modules/donations/donation.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import receiptRoutes from './modules/receipts/receipt.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import adminReportRoutes from './modules/reports/report.routes.js';

export function createApp(): Express {
  const app = express();

  // 1. Security & Headers
  app.use(helmet());
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // 2. Rate Limiting (100 requests per 15 minutes for standard IP, loosened for testing)
  if (env.NODE_ENV !== 'test') {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 250,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests from this IP, please try again after 15 minutes',
        },
      },
    });
    app.use('/api/', limiter);
  }

  // 3. Request Parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Health Check Endpoints
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
    });
  });

  app.get('/health/ready', async (_req: Request, res: Response) => {
    try {
      await prisma.user.findFirst({ select: { id: true } });
      res.status(200).json({
        status: 'READY',
        database: 'CONNECTED',
        timestamp: new Date().toISOString(),
      });
    } catch {
      res.status(503).json({
        status: 'NOT_READY',
        database: 'DISCONNECTED',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // 5. API V1 Routes
  const apiV1 = express.Router();

  apiV1.use('/auth', authRoutes);
  apiV1.use('/schemes', publicSchemeRouter);
  apiV1.use('/eligibility', eligibilityRoutes);
  apiV1.use('/campaigns', publicCampaignRouter);
  apiV1.use('/donations', donationRouter);
  apiV1.use('/payments', paymentRoutes);
  apiV1.use('/receipts', receiptRoutes);

  // Admin namespaced routes
  apiV1.use('/admin/schemes', adminSchemeRouter);
  apiV1.use('/admin/campaigns', adminCampaignRouter);
  apiV1.use('/admin/donations', adminDonationRouter);
  apiV1.use('/admin/ai', aiRoutes);
  apiV1.use('/admin', adminReportRoutes);

  app.use('/api/v1', apiV1);

  // 6. Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

