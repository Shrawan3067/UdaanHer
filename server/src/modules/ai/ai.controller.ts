import { Request, Response, NextFunction } from 'express';
import { aiService } from './ai.service.js';

export class AIController {
  async generateSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { officialNoticeText } = req.body || {};
      const result = await aiService.generateSchemeSummary(req.params.schemeId, req.user!.id, officialNoticeText);
      res.status(201).json({
        success: true,
        data: result,
        message: 'AI Hindi summary draft generated and queued for human review',
      });
    } catch (error) {
      next(error);
    }
  }

  async listReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = req.query.status as any;
      const reviews = await aiService.listReviews(status);
      res.status(200).json({
        success: true,
        data: reviews,
        message: 'AI Review drafts retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await aiService.updateReviewDraft(req.params.id, req.body, req.user!.id);
      res.status(200).json({
        success: true,
        data: updated,
        message: 'AI draft updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async approveReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const approved = await aiService.approveReview(req.params.id, req.user!.id);
      res.status(200).json({
        success: true,
        data: approved,
        message: 'AI summary approved and published to scheme',
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rejected = await aiService.rejectReview(req.params.id, req.user!.id);
      res.status(200).json({
        success: true,
        data: rejected,
        message: 'AI summary draft rejected',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AIController();

