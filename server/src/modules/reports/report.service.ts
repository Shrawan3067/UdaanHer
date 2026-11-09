import { DonationStatus, Role } from '../../types/models.js';
import { prisma } from '../../config/database.js';
import { maskPAN } from '../../utils/logger.js';
import { getFinancialYear } from '../../utils/financial-year.js';

export class ReportService {
  async getDashboardSummary() {
    const currentFY = getFinancialYear();

    const [
      totalDonationsCount,
      totalAmountResult,
      activeCampaignsCount,
      registeredDonorsCount,
      pendingAiReviewsCount,
      recentDonations,
      allSuccessfulDonations,
      campaigns,
    ] = await Promise.all([
      prisma.donation.count({ where: { status: DonationStatus.SUCCESS } }),
      prisma.donation.aggregate({
        where: { status: DonationStatus.SUCCESS },
        _sum: { amount: true },
      }),
      prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: Role.DONOR } }),
      prisma.aIReview.count({ where: { status: 'PENDING' } }),
      prisma.donation.findMany({
        where: { status: DonationStatus.SUCCESS },
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { title: true, slug: true } },
          receipt: { select: { receiptNumber: true, id: true } },
        },
      }),
      prisma.donation.findMany({
        where: { status: DonationStatus.SUCCESS },
        select: { amount: true, createdAt: true },
      }),
      prisma.campaign.findMany({
        select: {
          id: true,
          title: true,
          goalAmount: true,
          collectedAmount: true,
          status: true,
        },
      }),
    ]);

    const totalCollected = Number(totalAmountResult._sum.amount ?? 0);

    // Group donations by month for trend chart
    const monthMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Seed default last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear()}`;
      monthMap[label] = 0;
    }

    allSuccessfulDonations.forEach((d) => {
      const date = new Date(d.createdAt);
      const label = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (monthMap[label] !== undefined) {
        monthMap[label] += Number(d.amount);
      }
    });

    const donationTrends = Object.entries(monthMap).map(([month, total]) => ({
      month,
      amount: total,
    }));

    const campaignPerformance = campaigns.map((c) => ({
      title: c.title.length > 25 ? `${c.title.substring(0, 22)}...` : c.title,
      goal: Number(c.goalAmount),
      collected: Number(c.collectedAmount),
      percent: Math.min(100, Math.round((Number(c.collectedAmount) / Number(c.goalAmount)) * 100)),
    }));

    return {
      metrics: {
        totalDonationsCount,
        totalAmountCollected: totalCollected,
        activeCampaignsCount,
        registeredDonorsCount,
        pendingAiReviewsCount,
        financialYear: currentFY,
      },
      donationTrends,
      campaignPerformance,
      recentDonations: recentDonations.map((d) => ({
        id: d.id,
        donorName: d.donorName,
        donorEmail: d.donorEmail,
        donorPANMasked: maskPAN(d.donorPAN),
        amount: Number(d.amount),
        campaignTitle: d.campaign.title,
        receiptNumber: d.receipt?.receiptNumber,
        receiptId: d.receipt?.id,
        createdAt: d.createdAt,
      })),
    };
  }

  async getCampaignsReport() {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { donations: { where: { status: DonationStatus.SUCCESS } } },
        },
      },
    });

    return campaigns.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      goalAmount: Number(c.goalAmount),
      collectedAmount: Number(c.collectedAmount),
      donorCount: c._count.donations,
      percentage: Math.min(100, Math.round((Number(c.collectedAmount) / Number(c.goalAmount)) * 100)),
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
    }));
  }

  async getForm10BDReport(financialYear = getFinancialYear()) {
    const receipts = await prisma.receipt.findMany({
      where: { financialYear },
      orderBy: { issuedAt: 'asc' },
      include: {
        donation: {
          include: {
            campaign: { select: { title: true } },
          },
        },
      },
    });

    return receipts.map((r, index) => ({
      serialNo: index + 1,
      acknowledgementNo: r.receiptNumber,
      donorName: r.donorName,
      donorPAN: r.donorPAN,
      donorPANMasked: maskPAN(r.donorPAN),
      donorAddress: r.donation?.donorAddress || 'N/A',
      donationAmount: Number(r.donationAmount),
      modeOfDonation: r.donation?.paymentMethod || 'Online',
      paymentReference: r.donation?.paymentReference || 'N/A',
      campaign: r.donation?.campaign?.title || 'General Fund',
      dateOfDonation: r.issuedAt,
      financialYear: r.financialYear,
    }));
  }
}

export const reportService = new ReportService();

