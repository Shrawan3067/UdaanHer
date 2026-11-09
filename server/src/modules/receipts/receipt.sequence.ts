import { getFinancialYear } from "../../utils/financial-year.js";

export class ReceiptSequenceService {
  /**
   * Concurrency-safe atomic allocation of the next receipt number for the given financial year.
   * Uses native MongoDB atomic upsert & $inc inside a database transaction to prevent race conditions.
   */
  async allocateNextReceiptNumber(
    tx: any,
    targetDate: Date = new Date(),
  ): Promise<{
    receiptNumber: string;
    financialYear: string;
    sequenceNumber: number;
  }> {
    const financialYear = getFinancialYear(targetDate);

    // Atomic increment using Prisma upsert:
    // If the sequence for this FY exists, atomically increment nextNumber by 1.
    // If it does not exist, initialize nextNumber to 1.
    const seq = await tx.receiptSequence.upsert({
      where: { financialYear },
      update: {
        nextNumber: { increment: 1 },
      },
      create: {
        financialYear,
        nextNumber: 1,
      },
    });

    const sequenceNumber = seq.nextNumber;
    const padded = String(sequenceNumber).padStart(6, "0");
    const receiptNumber = `UDAAN/80G/${financialYear}/${padded}`;

    return {
      receiptNumber,
      financialYear,
      sequenceNumber,
    };
  }
}

export const receiptSequenceService = new ReceiptSequenceService();
