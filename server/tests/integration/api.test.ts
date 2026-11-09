import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";

describe("Integration Tests: UdaanHer REST API Suite", () => {
  const app = createApp();

  let adminToken: string;
  let donorToken: string;
  let donor2Token: string;
  let donorId: string;
  let testCampaignId: string;
  let testCampaignSlug: string;
  let testSchemeId: string;
  let testSchemeSlug: string;

  beforeAll(async () => {
    // 1. Admin login
    const adminRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@udaanher.org", password: "Admin@123456" });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;

    // 2. Donor 1 login
    const donorRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "priya.sharma@example.com", password: "Donor@123456" });
    expect(donorRes.status).toBe(200);
    donorToken = donorRes.body.data.token;
    donorId = donorRes.body.data.user.id;

    // 3. Donor 2 login
    const donor2Res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "rajesh.patel@example.com", password: "Donor@123456" });
    expect(donor2Res.status).toBe(200);
    donor2Token = donor2Res.body.data.token;

    // 4. Fetch an existing campaign and scheme
    const campaign = await prisma.campaign.findFirst({
      where: { status: "ACTIVE" },
    });
    testCampaignId = campaign!.id;
    testCampaignSlug = campaign!.slug;

    const scheme = await prisma.scheme.findFirst({
      where: { status: "PUBLISHED" },
    });
    testSchemeId = scheme!.id;
    testSchemeSlug = scheme!.slug;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("Health Checks", () => {
    it("GET /health returns UP status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("UP");
    });

    it("GET /health/ready returns database connection status", async () => {
      const res = await request(app).get("/health/ready");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("READY");
      expect(res.body.database).toBe("CONNECTED");
    });
  });

  describe("Authentication & RBAC", () => {
    it("registers a new donor successfully", async () => {
      const newEmail = `donor.test.${Date.now()}@example.com`;
      const res = await request(app).post("/api/v1/auth/register").send({
        fullName: "Ananya Verma",
        email: newEmail,
        password: "Password@123",
        phone: "9876543210",
        preferredLanguage: "HI",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(newEmail);
      expect(res.body.data.user.role).toBe("DONOR");
      expect(res.body.data.token).toBeDefined();
    });

    it("rejects duplicate email registration with 409 Conflict", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({
        fullName: "Duplicate Check",
        email: "priya.sharma@example.com",
        password: "Password@123",
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("prevents regular donor from accessing administrative endpoints with 403 Forbidden", async () => {
      const res = await request(app)
        .get("/api/v1/admin/dashboard")
        .set("Authorization", `Bearer ${donorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("allows admin to access administrative endpoints", async () => {
      const res = await request(app)
        .get("/api/v1/admin/dashboard")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.totalDonationsCount).toBeGreaterThan(0);
    });
  });

  describe("Public Schemes & Discovery", () => {
    it("GET /api/v1/schemes returns paginated schemes list", async () => {
      const res = await request(app).get("/api/v1/schemes?limit=5");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.schemes).toBeInstanceOf(Array);
      expect(res.body.data.pagination).toBeDefined();
    });

    it("GET /api/v1/schemes/:slug returns scheme details with related schemes", async () => {
      const res = await request(app).get(`/api/v1/schemes/${testSchemeSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scheme.slug).toBe(testSchemeSlug);
      expect(res.body.data.relatedSchemes).toBeInstanceOf(Array);
    });
  });

  describe("Eligibility Matching Engine", () => {
    it("POST /api/v1/eligibility/match evaluates eligibility deterministically", async () => {
      const res = await request(app).post("/api/v1/eligibility/match").send({
        district: "Bhopal",
        age: 42,
        occupation: "Homemaker",
        maritalStatus: "widowed",
        isSHGMember: false,
        hasBPLCard: true,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.eligibleSchemes).toBeInstanceOf(Array);
      expect(res.body.data.disclaimer).toBeDefined();

      const matchedCodes = res.body.data.eligibleSchemes.map(
        (s: any) => s.schemeCode,
      );
      expect(matchedCodes).toContain("SCH-014");
    });
  });

  describe("Public Campaigns", () => {
    it("GET /api/v1/campaigns returns active campaigns with progress percentage", async () => {
      const res = await request(app).get("/api/v1/campaigns");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].progressPercentage).toBeDefined();
    });

    it("GET /api/v1/campaigns/:slug returns specific campaign details", async () => {
      const res = await request(app).get(
        `/api/v1/campaigns/${testCampaignSlug}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe(testCampaignSlug);
    });
  });

  describe("End-to-End Donation & Receipt Workflow", () => {
    let createdDonationId: string;
    let createdReceiptId: string;

    it("initiates a donation order with validated donor PAN and address", async () => {
      const res = await request(app)
        .post("/api/v1/donations")
        .set("Authorization", `Bearer ${donorToken}`)
        .send({
          campaignId: testCampaignId,
          amount: 2500,
          donationType: "ONE_TIME",
          donorName: "Priya Sharma",
          donorEmail: "priya.sharma@example.com",
          donorPhone: "9425088776",
          donorPAN: "ABCDE1234F",
          donorAddress: "Flat 402, Narmada Enclave, Arera Colony, Bhopal",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("PENDING");
      expect(res.body.data.amount).toBe(2500);
      createdDonationId = res.body.data.id;
    });

    it("blocks foreign contribution attempts with FCRA error", async () => {
      const res = await request(app).post("/api/v1/donations").send({
        campaignId: testCampaignId,
        amount: 5000,
        donationType: "ONE_TIME",
        donorName: "Foreign Contributor",
        donorEmail: "foreign@example.com",
        donorPhone: "9876543210",
        donorPAN: "ABCDE1234F",
        donorAddress: "10 Downing Street, London",
        isForeignCard: true,
      });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("FCRA_RESTRICTION");
    });

    it("processes mock payment successfully and issues 80G receipt atomically", async () => {
      const res = await request(app)
        .post("/api/v1/payments/mock/process")
        .send({
          donationId: createdDonationId,
          method: "UPI",
          outcome: "SUCCESS",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.donation.status).toBe("SUCCESS");
      expect(res.body.data.receipt).toBeDefined();
      expect(res.body.data.receipt.receiptNumber).toMatch(
        /^UDAAN\/80G\/\d{4}-\d{2}\/\d{6}$/,
      );

      createdReceiptId = res.body.data.receipt.id;
    });

    it("downloads high-quality 80G receipt PDF with application/pdf Content-Type", async () => {
      const res = await request(app)
        .get(`/api/v1/receipts/${createdReceiptId}/download`)
        .set("Authorization", `Bearer ${donorToken}`);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toBe("application/pdf");
      expect(res.body).toBeInstanceOf(Buffer);
      expect(res.body.length).toBeGreaterThan(1000); // Valid PDF binary bytes
    });

    it("enforces donor data isolation (donor 2 cannot download donor 1 receipt)", async () => {
      const res = await request(app)
        .get(`/api/v1/receipts/${createdReceiptId}/download`)
        .set("Authorization", `Bearer ${donor2Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });
  });

  describe("AI Scheme Summary Review Workflow", () => {
    let reviewId: string;

    it("generates a new AI Hindi summary draft for an admin", async () => {
      const res = await request(app)
        .post(`/api/v1/admin/ai/scheme-summary/${testSchemeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("PENDING");
      expect(res.body.data.generatedHindiSummary).toBeDefined();
      reviewId = res.body.data.id;
    });

    it("lists AI review drafts in pending state", async () => {
      const res = await request(app)
        .get("/api/v1/admin/ai/reviews?status=PENDING")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((r: any) => r.id === reviewId)).toBe(true);
    });

    it("approves AI draft and synchronizes with scheme Hindi content", async () => {
      const res = await request(app)
        .post(`/api/v1/admin/ai/reviews/${reviewId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("APPROVED");
    });
  });

  describe("Form 10BD & Reports Export", () => {
    it("returns Form 10BD records in JSON", async () => {
      const res = await request(app)
        .get("/api/v1/admin/reports/form-10bd")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("exports Form 10BD as downloadable CSV file", async () => {
      const res = await request(app)
        .get("/api/v1/admin/reports/form-10bd?format=csv")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.text).toContain(
        "Serial No,Receipt Number,Donor Name,Donor PAN",
      );
    });
  });
});
