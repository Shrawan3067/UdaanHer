import { Request, Response, NextFunction } from "express";
import { reportService } from "./report.service.js";

export class ReportController {
  async getDashboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await reportService.getDashboardSummary();
      res.status(200).json({
        success: true,
        data,
        message: "Admin dashboard metrics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getCampaignsReport(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = await reportService.getCampaignsReport();
      res.status(200).json({
        success: true,
        data,
        message: "Campaigns performance report retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getForm10BD(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const fy = (req.query.financialYear as string) || undefined;
      const format = req.query.format as string;
      const data = await reportService.getForm10BDReport(fy);

      if (format === "csv") {
        const header =
          "Serial No,Receipt Number,Donor Name,Donor PAN,Address,Amount,Mode,Reference,Date,FY\n";
        const rows = data
          .map(
            (r) =>
              `"${r.serialNo}","${r.acknowledgementNo}","${r.donorName}","${r.donorPAN}","${r.donorAddress.replace(/"/g, '""')}","${r.donationAmount}","${r.modeOfDonation}","${r.paymentReference}","${new Date(r.dateOfDonation).toISOString().slice(0, 10)}","${r.financialYear}"`,
          )
          .join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=UdaanHer_Form10BD_${fy || "FY"}.csv`,
        );
        res.status(200).send(header + rows);
        return;
      }

      res.status(200).json({
        success: true,
        data,
        message: "Form 10BD records retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
