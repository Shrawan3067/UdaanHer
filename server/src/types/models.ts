/**
 * UdaanHer Database Models & Enums (MongoDB Atlas)
 * Giving women wings to fly
 */

export enum Role {
  DONOR = "DONOR",
  ADMIN = "ADMIN",
}

export enum Language {
  EN = "EN",
  HI = "HI",
}

export enum SchemeStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum CampaignStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  PAUSED = "PAUSED",
  ARCHIVED = "ARCHIVED",
}

export enum DonationType {
  ONE_TIME = "ONE_TIME",
  MONTHLY = "MONTHLY",
}

export enum DonationStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export enum AIReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum HelpRequestStatus {
  PENDING = "PENDING",
  CONTACTED = "CONTACTED",
  RESOLVED = "RESOLVED",
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  role: Role;
  preferredLanguage: Language;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  imageUrl?: string | null;
  goalAmount: number;
  collectedAmount: number;
  startDate: Date;
  endDate?: Date | null;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scheme {
  id: string;
  schemeCode: string;
  name: string;
  nameHi?: string | null;
  slug: string;
  category: string;
  need: string;
  description: string;
  descriptionHi?: string | null;
  benefit: string;
  benefitHi?: string | null;
  eligibilityRules: any;
  requiredDocuments: any;
  applicationSteps: any;
  applicableDistricts: string[];
  officialSourceUrl: string;
  nearestHelpCentre?: any;
  lastCheckedAt: Date;
  status: SchemeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Donation {
  id: string;
  donorId?: string | null;
  campaignId: string;
  amount: number;
  currency: string;
  donationType: DonationType;
  status: DonationStatus;
  idempotencyKey?: string | null;
  paymentReference?: string | null;
  paymentMethod?: string | null;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorPAN: string;
  donorAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  donationId: string;
  provider: string;
  transactionReference: string;
  status: PaymentStatus;
  responseMetadata: any;
  createdAt: Date;
}

export interface Receipt {
  id: string;
  donationId: string;
  receiptNumber: string;
  donorName: string;
  donorPAN: string;
  donationAmount: number;
  trustPAN: string;
  trust80GRegistrationNumber: string;
  financialYear: string;
  pdfStorageKey?: string | null;
  pdfPath?: string | null;
  issuedAt: Date;
}

export interface ReceiptSequence {
  id: string;
  financialYear: string;
  nextNumber: number;
  updatedAt: Date;
}

export interface AIReview {
  id: string;
  schemeId: string;
  generatedHindiSummary: string;
  generatedEnglishSummary: string;
  missingInformation?: any;
  status: AIReviewStatus;
  reviewedById?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: any;
  createdAt: Date;
}

export interface HelpRequest {
  id: string;
  name: string;
  phone: string;
  district: string;
  schemeCode?: string | null;
  notes?: string | null;
  status: HelpRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}
