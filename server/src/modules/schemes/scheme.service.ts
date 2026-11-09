import { SchemeStatus } from '../../types/models.js';
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/app-error.js';

export interface ListSchemesParams {
  search?: string;
  category?: string;
  district?: string;
  need?: string;
  status?: SchemeStatus;
  page: number;
  limit: number;
}

export class SchemeService {
  async listSchemes(params: ListSchemesParams, isAdmin = false) {
    const { search, category, district, need, status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Public users only see PUBLISHED schemes
    if (!isAdmin) {
      where.status = SchemeStatus.PUBLISHED;
    } else if (status) {
      where.status = status;
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (need) {
      where.need = { equals: need, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameHi: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { schemeCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by district in array field
    if (district) {
      where.applicableDistricts = {
        has: district,
      };
    }

    const [total, schemes] = await Promise.all([
      prisma.scheme.count({ where }),
      prisma.scheme.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ lastCheckedAt: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          schemeCode: true,
          name: true,
          nameHi: true,
          slug: true,
          category: true,
          need: true,
          description: true,
          descriptionHi: true,
          benefit: true,
          benefitHi: true,
          eligibilityRules: true,
          requiredDocuments: true,
          applicableDistricts: true,
          officialSourceUrl: true,
          lastCheckedAt: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      schemes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getSchemeBySlug(slug: string, isAdmin = false) {
    const where: any = { slug };

    const scheme = await prisma.scheme.findUnique({
      where,
      include: {
        aiReviews: {
          where: isAdmin ? undefined : { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!scheme) {
      throw AppError.notFound('Scheme not found');
    }

    if (!isAdmin && scheme.status !== SchemeStatus.PUBLISHED) {
      throw AppError.notFound('Scheme not found or unpublished');
    }

    // Fetch up to 3 related schemes by category
    const relatedSchemes = await prisma.scheme.findMany({
      where: {
        category: scheme.category,
        id: { not: scheme.id },
        status: SchemeStatus.PUBLISHED,
      },
      take: 3,
      select: {
        id: true,
        schemeCode: true,
        name: true,
        nameHi: true,
        slug: true,
        category: true,
        benefit: true,
        benefitHi: true,
      },
    });

    return { scheme, relatedSchemes };
  }

  async getSchemeById(id: string) {
    const scheme = await prisma.scheme.findUnique({
      where: { id },
      include: {
        aiReviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!scheme) {
      throw AppError.notFound('Scheme not found');
    }

    return scheme;
  }

  async createScheme(data: any, adminUserId: string) {
    const slug = this.generateSlug(data.name, data.schemeCode);

    const existingCode = await prisma.scheme.findUnique({
      where: { schemeCode: data.schemeCode },
    });
    if (existingCode) {
      throw AppError.conflict(`Scheme with code '${data.schemeCode}' already exists`);
    }

    const scheme = await prisma.scheme.create({
      data: {
        ...data,
        slug,
        lastCheckedAt: data.lastCheckedAt ? new Date(data.lastCheckedAt) : new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'CREATE_SCHEME',
        entityType: 'SCHEME',
        entityId: scheme.id,
        metadata: { schemeCode: scheme.schemeCode, name: scheme.name },
      },
    });

    return scheme;
  }

  async updateScheme(id: string, data: any, adminUserId: string) {
    const existing = await prisma.scheme.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Scheme not found');
    }

    let slug = existing.slug;
    if (data.name && data.name !== existing.name) {
      slug = this.generateSlug(data.name, data.schemeCode || existing.schemeCode);
    }

    const updated = await prisma.scheme.update({
      where: { id },
      data: {
        ...data,
        slug,
        lastCheckedAt: data.lastCheckedAt ? new Date(data.lastCheckedAt) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'UPDATE_SCHEME',
        entityType: 'SCHEME',
        entityId: updated.id,
        metadata: { changes: Object.keys(data) },
      },
    });

    return updated;
  }

  async publishScheme(id: string, adminUserId: string) {
    return this.updateScheme(id, { status: SchemeStatus.PUBLISHED, lastCheckedAt: new Date() }, adminUserId);
  }

  async archiveScheme(id: string, adminUserId: string) {
    return this.updateScheme(id, { status: SchemeStatus.ARCHIVED }, adminUserId);
  }

  async deleteScheme(id: string, adminUserId: string) {
    const existing = await prisma.scheme.findUnique({ where: { id } });
    if (!existing) {
      throw AppError.notFound('Scheme not found');
    }

    await prisma.scheme.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'DELETE_SCHEME',
        entityType: 'SCHEME',
        entityId: id,
        metadata: { schemeCode: existing.schemeCode, name: existing.name },
      },
    });

    return { id, deleted: true };
  }

  private generateSlug(name: string, code: string): string {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const cleanCode = code
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    return `${cleanName}-${cleanCode}`;
  }
}

export const schemeService = new SchemeService();

