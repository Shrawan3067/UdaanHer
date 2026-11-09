import { CampaignStatus } from '../../types/models.js';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/app-error.js';

export class CampaignService {
  async listPublicCampaigns() {
    const campaigns = await prisma.campaign.findMany({
      where: { status: CampaignStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { donations: { where: { status: 'SUCCESS' } } },
        },
      },
    });

    return campaigns.map((c) => ({
      ...c,
      goalAmount: Number(c.goalAmount),
      collectedAmount: Number(c.collectedAmount),
      progressPercentage: Math.min(100, Math.round((Number(c.collectedAmount) / Number(c.goalAmount)) * 100)),
      donorCount: c._count.donations,
    }));
  }

  async getCampaignBySlug(slug: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { donations: { where: { status: 'SUCCESS' } } },
        },
      },
    });

    if (!campaign) {
      throw AppError.notFound('Campaign not found');
    }

    return {
      ...campaign,
      goalAmount: Number(campaign.goalAmount),
      collectedAmount: Number(campaign.collectedAmount),
      progressPercentage: Math.min(100, Math.round((Number(campaign.collectedAmount) / Number(campaign.goalAmount)) * 100)),
      donorCount: campaign._count.donations,
    };
  }

  async listAdminCampaigns() {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { donations: { where: { status: 'SUCCESS' } } },
        },
      },
    });

    return campaigns.map((c) => ({
      ...c,
      goalAmount: Number(c.goalAmount),
      collectedAmount: Number(c.collectedAmount),
      progressPercentage: Math.min(100, Math.round((Number(c.collectedAmount) / Number(c.goalAmount)) * 100)),
      donorCount: c._count.donations,
    }));
  }

  async createCampaign(data: any, adminUserId: string) {
    const slug = this.generateSlug(data.title);

    const campaign = await prisma.campaign.create({
      data: {
        ...data,
        slug,
        goalAmount: Number(data.goalAmount),
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'CREATE_CAMPAIGN',
        entityType: 'CAMPAIGN',
        entityId: campaign.id,
        metadata: { title: campaign.title, goalAmount: data.goalAmount },
      },
    });

    return campaign;
  }

  async updateCampaign(id: string, data: any, adminUserId: string) {
    const existing = await prisma.campaign.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Campaign not found');
    }

    let slug = existing.slug;
    if (data.title && data.title !== existing.title) {
      slug = this.generateSlug(data.title);
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...data,
        slug,
        goalAmount: data.goalAmount ? Number(data.goalAmount) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_CAMPAIGN',
        entityType: 'CAMPAIGN',
        entityId: updated.id,
        metadata: { changes: Object.keys(data) },
      },
    });

    return updated;
  }

  private generateSlug(title: string): string {
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${cleanTitle}-${randomSuffix}`;
  }
}

export const campaignService = new CampaignService();

