import { DonationStatus, PaymentStatus } from "../../types/models.js";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/app-error.js";
import { receiptSequenceService } from "../receipts/receipt.sequence.js";
import { env } from "../../config/env.js";
import { withTransactionRetry } from "../../utils/transaction-retry.js";

export interface ProcessMockPaymentDTO {
  donationId: string;
  method: "UPI" | "CARD" | "NET_BANKING";
  outcome: "SUCCESS" | "FAILED" | "PENDING";
  isForeignCard?: boolean;
}

export class PaymentService {
  async processMockPayment(dto: ProcessMockPaymentDTO) {
    // 1. FCRA foreign card check
    if (dto.isForeignCard) {
      throw AppError.badRequest(
        "Foreign card transactions are blocked. UdaanHer does not process foreign contributions under FCRA restrictions.",
        "FCRA_RESTRICTION",
      );
    }

    // 2. Fetch existing donation
    const donation = await prisma.donation.findUnique({
      where: { id: dto.donationId },
      include: {
        receipt: true,
        campaign: true,
      },
    });

    if (!donation) {
      throw AppError.notFound("Donation not found");
    }

    // 3. Idempotency Check: if already successful, return existing without reallocating
    if (donation.status === DonationStatus.SUCCESS && donation.receipt) {
      return {
        donation: {
          ...donation,
          amount: Number(donation.amount),
        },
        receipt: {
          ...donation.receipt,
          donationAmount: Number(donation.receipt.donationAmount),
        },
        payment: null,
        message:
          "Donation was already processed successfully (Idempotent response).",
        isIdempotent: true,
      };
    }

    const transactionReference = `TXN_SIM_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Handle FAILED outcome
    if (dto.outcome === "FAILED") {
      const result = await prisma.$transaction(async (tx) => {
        const updatedDonation = await tx.donation.update({
          where: { id: dto.donationId },
          data: {
            status: DonationStatus.FAILED,
            paymentMethod: dto.method,
            paymentReference: transactionReference,
          },
        });

        const payment = await tx.payment.create({
          data: {
            donationId: dto.donationId,
            provider: "MOCK_PAYMENT_SIMULATOR",
            transactionReference,
            status: PaymentStatus.FAILED,
            responseMetadata: {
              method: dto.method,
              simulated: true,
              failureReason:
                "Simulated payment decline / insufficient funds or cancelled by user.",
              processedAt: new Date().toISOString(),
            },
          },
        });

        return { donation: updatedDonation, payment, receipt: null };
      });

      return {
        ...result,
        donation: {
          ...result.donation,
          amount: Number(result.donation.amount),
        },
        message:
          "Payment simulation resulted in decline. No receipt was issued.",
      };
    }

    // 5. Handle PENDING outcome
    if (dto.outcome === "PENDING") {
      const payment = await prisma.payment.create({
        data: {
          donationId: dto.donationId,
          provider: "MOCK_PAYMENT_SIMULATOR",
          transactionReference,
          status: PaymentStatus.PENDING,
          responseMetadata: {
            method: dto.method,
            simulated: true,
            status: "PENDING_CONFIRMATION",
            processedAt: new Date().toISOString(),
          },
        },
      });

      return {
        donation: {
          ...donation,
          amount: Number(donation.amount),
        },
        payment,
        receipt: null,
        message:
          "Payment is pending banking network confirmation. No receipt issued yet.",
      };
    }

    // 6. Handle SUCCESS outcome with Concurrency-Safe Receipt Number Allocation
    const result = await withTransactionRetry(() =>
      prisma.$transaction(async (tx) => {
        // Step 0: Fetch current donation record inside transaction
        const current = await tx.donation.findUnique({
          where: { id: dto.donationId },
        });

        if (!current) {
          throw AppError.notFound(
            "Donation record not found during transaction",
          );
        }

        // If a concurrent request already completed this payment:
        if (current.status === DonationStatus.SUCCESS) {
          const existingReceipt = await tx.receipt.findUnique({
            where: { donationId: dto.donationId },
          });
          const currentDonation = await tx.donation.findUnique({
            where: { id: dto.donationId },
            include: { campaign: true },
          });
          return {
            donation: currentDonation!,
            payment: null,
            receipt: existingReceipt!,
          };
        }

        // Step A: Atomically allocate next receipt number from ReceiptSequence
        const { receiptNumber, financialYear } =
          await receiptSequenceService.allocateNextReceiptNumber(
            tx,
            new Date(),
          );

        // Step B: Update Donation status to SUCCESS
        const updatedDonation = await tx.donation.update({
          where: { id: dto.donationId },
          data: {
            status: DonationStatus.SUCCESS,
            paymentMethod: dto.method,
            paymentReference: transactionReference,
          },
          include: {
            campaign: true,
          },
        });

        // Step C: Increment Campaign collectedAmount
        await tx.campaign.update({
          where: { id: updatedDonation.campaignId },
          data: {
            collectedAmount: {
              increment: updatedDonation.amount,
            },
          },
        });

        // Step D: Record Payment in SUCCESS state
        const payment = await tx.payment.create({
          data: {
            donationId: dto.donationId,
            provider: "MOCK_PAYMENT_SIMULATOR",
            transactionReference,
            status: PaymentStatus.SUCCESS,
            responseMetadata: {
              method: dto.method,
              simulated: true,
              gatewayStatus: "SUCCESS",
              isRecurringIntent: updatedDonation.donationType === "MONTHLY",
              processedAt: new Date().toISOString(),
            },
          },
        });

        // Step E: Create Receipt Snapshot (capturing immutable trust & donor details)
        const receipt = await tx.receipt.create({
          data: {
            donationId: updatedDonation.id,
            receiptNumber,
            donorName: updatedDonation.donorName,
            donorPAN: updatedDonation.donorPAN,
            donationAmount: updatedDonation.amount,
            trustPAN: env.TRUST_PAN,
            trust80GRegistrationNumber: env.TRUST_80G_REGISTRATION,
            financialYear,
            issuedAt: new Date(),
          },
        });

        return {
          donation: updatedDonation,
          payment,
          receipt,
        };
      }),
    );

    return {
      donation: {
        ...result.donation,
        amount: Number(result.donation.amount),
      },
      payment: result.payment,
      receipt: {
        ...result.receipt,
        donationAmount: Number(result.receipt.donationAmount),
      },
      message:
        "Payment simulated successfully. Concurrency-safe 80G receipt generated.",
    };
  }

  async getPaymentStatus(id: string) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        donation: {
          include: { receipt: true },
        },
      },
    });

    if (!payment) {
      throw AppError.notFound("Payment record not found");
    }

    return payment;
  }
}

export const paymentService = new PaymentService();
