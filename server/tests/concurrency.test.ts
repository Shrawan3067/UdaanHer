import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/config/database.js";
import { receiptSequenceService } from "../src/modules/receipts/receipt.sequence.js";
import { paymentService } from "../src/modules/payments/payment.service.js";
import { donationService } from "../src/modules/donations/donation.service.js";
import { withTransactionRetry } from "../src/utils/transaction-retry.js";

describe("Critical Concurrency & Integrity Tests (Database Transactions)", () => {
  let testCampaignId: string;

  beforeAll(async () => {
    // Ensure active campaign exists
    let campaign = await prisma.campaign.findFirst({
      where: { status: "ACTIVE" },
    });
    if (!campaign) {
      campaign = await prisma.campaign.create({
        data: {
          title: "Concurrency Test Campaign",
          slug: `concurrency-test-campaign-${Date.now()}`,
          description: "Testing concurrency safety in database transactions",
          category: "Test",
          goalAmount: 100000,
          startDate: new Date(),
          status: "ACTIVE",
        },
      });
    }
    testCampaignId = campaign.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("allocates strictly unique receipt numbers under 20 concurrent requests without collisions", async () => {
    const concurrentRequests = 20;

    // Fire 20 parallel transactions simultaneously with optimistic retry for MongoDB
    const allocationPromises = Array.from({ length: concurrentRequests }).map(
      () =>
        withTransactionRetry(() =>
          prisma.$transaction(async (tx) => {
            return receiptSequenceService.allocateNextReceiptNumber(
              tx,
              new Date(),
            );
          }),
        ),
    );

    const results = await Promise.all(allocationPromises);

    expect(results).toHaveLength(concurrentRequests);

    const receiptNumbers = results.map((r) => r.receiptNumber);
    const uniqueReceiptNumbers = new Set(receiptNumbers);

    // Assert that every single allocated receipt number is 100% unique!
    expect(uniqueReceiptNumbers.size).toBe(concurrentRequests);

    // Verify format: UDAAN/80G/YYYY-YY/XXXXXX
    for (const num of receiptNumbers) {
      expect(num).toMatch(/^UDAAN\/80G\/\d{4}-\d{2}\/\d{6}$/);
    }
  });

  it("handles concurrent duplicate payment processing idempotently without double receipt generation", async () => {
    // 1. Create a single donation
    const donation = await donationService.createDonation({
      campaignId: testCampaignId,
      amount: 1000,
      donationType: "ONE_TIME",
      donorName: "Concurrency Test Donor",
      donorEmail: `concurrency.${Date.now()}@example.com`,
      donorPhone: "9988776655",
      donorPAN: "TESTP1234D",
      donorAddress: "123 Test Street, Bhopal",
      idempotencyKey: `IDEMP-CONCUR-${Date.now()}`,
    });

    // 2. Fire 5 simultaneous processMockPayment calls for the SAME donation
    const paymentAttempts = Array.from({ length: 5 }).map(() =>
      paymentService.processMockPayment({
        donationId: donation.id,
        method: "UPI",
        outcome: "SUCCESS",
      }),
    );

    const outcomes = await Promise.all(paymentAttempts);

    // All must succeed
    expect(outcomes).toHaveLength(5);

    // Exactly one receipt must exist in the database for this donation
    const receiptsInDb = await prisma.receipt.findMany({
      where: { donationId: donation.id },
    });

    expect(receiptsInDb).toHaveLength(1);

    // All 5 returned outcomes must refer to the EXACT same receipt number!
    const receiptNumbers = outcomes.map((o) => o.receipt?.receiptNumber);
    const uniqueNumbers = new Set(receiptNumbers);
    expect(uniqueNumbers.size).toBe(1);
  });

  it("guarantees failed payments do not issue receipts or increment sequence", async () => {
    const failedDonation = await donationService.createDonation({
      campaignId: testCampaignId,
      amount: 500,
      donationType: "ONE_TIME",
      donorName: "Declined Donor",
      donorEmail: `declined.${Date.now()}@example.com`,
      donorPhone: "9123456789",
      donorPAN: "FAILP1234F",
      donorAddress: "456 Declined Road, Bhopal",
    });

    const result = await paymentService.processMockPayment({
      donationId: failedDonation.id,
      method: "CARD",
      outcome: "FAILED",
    });

    expect(result.donation.status).toBe("FAILED");
    expect(result.receipt).toBeNull();

    const receipt = await prisma.receipt.findUnique({
      where: { donationId: failedDonation.id },
    });
    expect(receipt).toBeNull();
  });
});
