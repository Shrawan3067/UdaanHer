import crypto from 'crypto';
import { CampaignStatus, DonationStatus, DonationType, Role } from '../../types/models.js';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/app-error.js';
import { maskPAN } from '../../utils/logger.js';

export interface CreateDonationDTO {
  campaignId: string;
  amount: number;
  donationType: 'ONE_TIME' | 'MONTHLY';
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  donorPAN: string;
  donorAddress: string;
  idempotencyKey?: string;
  isForeignCard?: boolean;
}

export class DonationService {
  async createDonation(dto: CreateDonationDTO, authenticatedUserId?: string) {
    // 1. FCRA foreign contribution block
    if (dto.isForeignCard) {
      throw AppError.badRequest(
        'Foreign contributions cannot be accepted through this platform because FCRA processing is outside the current phase. Only domestic Indian INR payments are permitted.',
        'FCRA_RESTRICTION'
      );
    }

    // 2. Check Idempotency Key if supplied
    if (dto.idempotencyKey) {
      const existing = await prisma.donation.findUnique({
        where: { idempotencyKey: dto.idempotencyKey },
        include: { receipt: true, campaign: true },
      });
      if (existing) {
        return {
          ...existing,
          amount: Number(existing.amount),
          donorPANMasked: maskPAN(existing.donorPAN),
          isDuplicateSubmission: true,
        };
      }
    }

    // 3. Verify Campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: dto.campaignId },
    });
    if (!campaign) {
      throw AppError.notFound('Campaign not found');
    }
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw AppError.badRequest('Campaign is not currently accepting donations');
    }

    // 4. Resolve donorId (authenticated user or look up existing user with same email)
    let donorId = authenticatedUserId;
    if (!donorId) {
      const user = await prisma.user.findUnique({
        where: { email: dto.donorEmail.toLowerCase() },
      });
      if (user) {
        donorId = user.id;
      }
    }

    const donation = await prisma.donation.create({
      data: {
        campaignId: dto.campaignId,
        donorId: donorId || null,
        amount: Number(dto.amount),
        currency: 'INR',
        donationType: dto.donationType === 'MONTHLY' ? DonationType.MONTHLY : DonationType.ONE_TIME,
        status: DonationStatus.PENDING,
        idempotencyKey: dto.idempotencyKey?.trim() || `IDEMP-${crypto.randomUUID()}`,
        donorName: dto.donorName,
        donorEmail: dto.donorEmail.toLowerCase(),
        donorPhone: dto.donorPhone,
        donorPAN: dto.donorPAN.toUpperCase(),
        donorAddress: dto.donorAddress,
      },
      include: {
        campaign: { select: { title: true, slug: true } },
      },
    });

    return {
      ...donation,
      amount: Number(donation.amount),
      donorPANMasked: maskPAN(donation.donorPAN),
    };
  }

  async getDonationById(id: string, currentUserId?: string, role?: Role) {
    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        campaign: { select: { title: true, slug: true, category: true } },
        receipt: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    if (!donation) {
      throw AppError.notFound('Donation not found');
    }

    // Access control: Only owner or ADMIN
    if (role !== Role.ADMIN) {
      if (donation.donorId && donation.donorId !== currentUserId) {
        throw AppError.forbidden('You are not authorized to view this donation');
      }
    }

    return {
      ...donation,
      amount: Number(donation.amount),
      donorPANMasked: maskPAN(donation.donorPAN),
      receipt: donation.receipt
        ? {
            ...donation.receipt,
            donationAmount: Number(donation.receipt.donationAmount),
          }
        : null,
    };
  }

  async getDonationsForCurrentUser(userId: string) {
    const donations = await prisma.donation.findMany({
      where: { donorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { title: true, slug: true } },
        receipt: true,
      },
    });

    return donations.map((d) => ({
      ...d,
      amount: Number(d.amount),
      donorPANMasked: maskPAN(d.donorPAN),
      receipt: d.receipt
        ? {
            ...d.receipt,
            donationAmount: Number(d.receipt.donationAmount),
          }
        : null,
    }));
  }

  async listAllDonationsAdmin(params: {
    search?: string;
    status?: DonationStatus;
    campaignId?: string;
    page: number;
    limit: number;
  }) {
    const { search, status, campaignId, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (campaignId) {
      where.campaignId = campaignId;
    }

    if (search) {
      where.OR = [
        { donorName: { contains: search, mode: 'insensitive' } },
        { donorEmail: { contains: search, mode: 'insensitive' } },
        { donorPhone: { contains: search, mode: 'insensitive' } },
        { receipt: { receiptNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, donations] = await Promise.all([
      prisma.donation.count({ where }),
      prisma.donation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { title: true, slug: true } },
          receipt: true,
        },
      }),
    ]);

    return {
      donations: donations.map((d) => ({
        id: d.id,
        donorName: d.donorName,
        donorEmail: d.donorEmail,
        donorPhone: d.donorPhone,
        donorPANMasked: maskPAN(d.donorPAN),
        donorAddress: d.donorAddress,
        amount: Number(d.amount),
        currency: d.currency,
        donationType: d.donationType,
        status: d.status,
        paymentMethod: d.paymentMethod,
        paymentReference: d.paymentReference,
        campaign: d.campaign,
        receipt: d.receipt
          ? {
              id: d.receipt.id,
              receiptNumber: d.receipt.receiptNumber,
              financialYear: d.receipt.financialYear,
              issuedAt: d.receipt.issuedAt,
            }
          : null,
        createdAt: d.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

export const donationService = new DonationService();

