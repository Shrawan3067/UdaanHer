import { Request, Response, NextFunction } from 'express';
import { schemeService } from './scheme.service.js';
import { Role } from '../../types/models.js';

export class SchemeController {
  async listSchemes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAdmin = req.user?.role === Role.ADMIN;
      const result = await schemeService.listSchemes(req.query as any, isAdmin);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Schemes retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getSchemeBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isAdmin = req.user?.role === Role.ADMIN;
      const result = await schemeService.getSchemeBySlug(req.params.slug, isAdmin);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Scheme details retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getSchemeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schemeService.getSchemeById(req.params.id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Scheme retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async createScheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schemeService.createScheme(req.body, req.user!.id);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Scheme created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateScheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schemeService.updateScheme(req.params.id, req.body, req.user!.id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Scheme updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async publishScheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schemeService.publishScheme(req.params.id, req.user!.id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Scheme published successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async archiveScheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schemeService.archiveScheme(req.params.id, req.user!.id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Scheme archived successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteScheme(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await schemeService.deleteScheme(req.params.id, req.user!.id);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Scheme deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async askQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { question, district } = req.body;
      const result = await schemeService.askQuestion(question, district);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Scheme recommendations evaluated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const schemeController = new SchemeController();

