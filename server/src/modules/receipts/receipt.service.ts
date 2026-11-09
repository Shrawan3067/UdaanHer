import { Role } from '../../types/models.js';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/app-error.js';
import { receiptPdfGenerator, ReceiptPdfData } from './receipt.pdf.js';
import { env } from '../../config/env.js';

export class ReceiptService {
  async getReceiptById(receiptId: string, currentUserId?: string, role?: Role) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        donation: {
          include: {
            campaign: { select: { title: true, slug: true } },
          },
        },
      },
    });

    if (!receipt) {
      throw AppError.notFound('Receipt not found');
    }

    // Authorization check
    if (role !== Role.ADMIN) {
      if (receipt.donation.donorId && receipt.donation.donorId !== currentUserId) {
        throw AppError.forbidden('You are not authorized to view this receipt');
      }
    }

    return {
      ...receipt,
      donationAmount: Number(receipt.donationAmount),
    };
  }

  async getReceiptByDonationId(donationId: string, currentUserId?: string, role?: Role) {
    const receipt = await prisma.receipt.findUnique({
      where: { donationId },
      include: {
        donation: {
          include: {
            campaign: { select: { title: true, slug: true } },
          },
        },
      },
    });

    if (!receipt) {
      throw AppError.notFound('Receipt not found for this donation');
    }

    if (role !== Role.ADMIN) {
      if (receipt.donation.donorId && receipt.donation.donorId !== currentUserId) {
        throw AppError.forbidden('You are not authorized to view this receipt');
      }
    }

    return {
      ...receipt,
      donationAmount: Number(receipt.donationAmount),
    };
  }

  async generateReceiptPdf(receiptId: string, currentUserId?: string, role?: Role) {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        donation: {
          include: {
            campaign: { select: { title: true } },
          },
        },
      },
    });

    if (!receipt) {
      throw AppError.notFound('Receipt not found');
    }

    if (role !== Role.ADMIN) {
      if (receipt.donation.donorId && receipt.donation.donorId !== currentUserId) {
        throw AppError.forbidden('You are not authorized to download this receipt');
      }
    }

    const pdfData: ReceiptPdfData = {
      receiptNumber: receipt.receiptNumber,
      financialYear: receipt.financialYear,
      issueDate: receipt.issuedAt,
      donorName: receipt.donorName,
      donorPAN: receipt.donorPAN,
      donorAddress: receipt.donation.donorAddress,
      donorEmail: receipt.donation.donorEmail,
      donationAmount: Number(receipt.donationAmount),
      paymentMethod: receipt.donation.paymentMethod || 'Online Simulation',
      transactionReference: receipt.donation.paymentReference || 'MOCK_TXN_REF',
      campaignTitle: receipt.donation.campaign.title,
      trustName: env.TRUST_NAME,
      trustAddress: env.TRUST_ADDRESS,
      trustPAN: receipt.trustPAN,
      trust80GRegistrationNumber: receipt.trust80GRegistrationNumber,
    };

    return receiptPdfGenerator.generatePdfStream(pdfData);
  }
}

export const receiptService = new ReceiptService();
