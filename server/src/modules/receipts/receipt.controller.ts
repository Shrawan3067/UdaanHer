import { Request, Response, NextFunction } from "express";
import { receiptService } from "./receipt.service.js";

export class ReceiptController {
  async getById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const receipt = await receiptService.getReceiptById(
        req.params.id,
        req.user?.id,
        req.user?.role,
      );
      res.status(200).json({
        success: true,
        data: receipt,
        message: "Receipt details retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadPdf(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const pdfStream = await receiptService.generateReceiptPdf(
        req.params.id,
        req.user?.id,
        req.user?.role,
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=UdaanHer_80G_Receipt_${req.params.id}.pdf`,
      );

      pdfStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}

export const receiptController = new ReceiptController();
