import { Request, Response, NextFunction } from "express";
import { automationService } from "./automation.service.js";

export class AutomationController {
  async getStatus(_req: Request, res: Response, next: NextFunction) {
    try {
      const status = await automationService.getAutomationStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (err) {
      next(err);
    }
  }

  async triggerSuite(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await automationService.triggerAllAutomations();
      res.status(200).json({
        success: true,
        message: "Automated receipts, certificates, and reminders processed successfully.",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const automationController = new AutomationController();

