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

  async askQuestion(question: string, defaultDistrict?: string) {
    const qLower = question.toLowerCase();

    // 1. Detect MP district from question or defaultDistrict
    const mpDistricts = [
      { en: 'Bhopal', hi: 'भोपाल' },
      { en: 'Sehore', hi: 'सीहोर' },
      { en: 'Raisen', hi: 'रायसेन' },
      { en: 'Rajgarh', hi: 'राजगढ़' },
      { en: 'Vidisha', hi: 'विदिशा' },
      { en: 'Hoshangabad', hi: 'होशंगाबाद' },
      { en: 'Harda', hi: 'हरदा' },
      { en: 'Betul', hi: 'बैतूल' },
      { en: 'Guna', hi: 'गुना' },
    ];

    let detectedDistrict: string | undefined =
      defaultDistrict && defaultDistrict !== 'All Districts' ? defaultDistrict : undefined;

    for (const d of mpDistricts) {
      if (qLower.includes(d.en.toLowerCase()) || question.includes(d.hi)) {
        detectedDistrict = d.en;
        break;
      }
    }

    // 2. Detect Need / Domain Keywords
    let detectedNeed: string | undefined;
    const rulesUsed: string[] = [];

    const pensionKeywords = ['पेंशन', 'विधवा', 'वृद्धा', 'कल्याणी', 'निराश्रित', 'pension', 'widow', 'elderly'];
    const livelihoodKeywords = ['आजीविका', 'लोन', 'ऋण', 'स्व सहायता', 'समूह', 'shg', 'दुकान', 'व्यवसाय', 'सिलाई', 'livelihood', 'loan', 'self-help', 'रोजगार'];
    const healthKeywords = ['मातृत्व', 'गर्भवती', 'प्रसूति', 'बच्चा', 'शिशु', 'स्वास्थ्य', 'maternity', 'pregnant', 'health', 'डिलीवरी'];
    const educationKeywords = ['शिक्षा', 'छात्रवृत्ति', 'कॉलेज', 'लाडली', 'बेटी', 'school', 'education', 'scholarship', 'पढ़ाई'];

    if (pensionKeywords.some((k) => qLower.includes(k) || question.includes(k))) {
      detectedNeed = 'Pension';
      rulesUsed.push('पहचानी गई आवश्यकता: विधवा / वृद्धावस्था सामाजिक सुरक्षा पेंशन');
    } else if (livelihoodKeywords.some((k) => qLower.includes(k) || question.includes(k))) {
      detectedNeed = 'Livelihood';
      rulesUsed.push('पहचानी गई आवश्यकता: महिला स्व-सहायता समूह (SHG) व आजीविका ऋण सहायता');
    } else if (healthKeywords.some((k) => qLower.includes(k) || question.includes(k))) {
      detectedNeed = 'Health';
      rulesUsed.push('पहचानी गई आवश्यकता: मातृत्व लाभ व संस्थागत प्रसव आर्थिक सहायता');
    } else if (educationKeywords.some((k) => qLower.includes(k) || question.includes(k))) {
      detectedNeed = 'Education';
      rulesUsed.push('पहचानी गई आवश्यकता: बालिका शिक्षा एवं उच्च शिक्षा छात्रवृत्ति प्रोत्साहन');
    }

    if (detectedDistrict) {
      rulesUsed.push(`लागू जिला: ${detectedDistrict} (मध्य प्रदेश के 9 अधिकृत जनपदों में सत्यापित)`);
    }

    if (['बीपीएल', 'राशन', 'bpl', 'ration', 'गरीबी'].some((k) => qLower.includes(k) || question.includes(k))) {
      rulesUsed.push('बीपीएल राशन कार्ड प्राथमिकता नियम लागू');
    }

    // 3. Query Published Schemes
    const allPublished = await prisma.scheme.findMany({
      where: { status: SchemeStatus.PUBLISHED },
    });

    // Score schemes
    const scored = allPublished.map((s) => {
      let score = 0;
      const sFullText = (
        s.name + ' ' + (s.nameHi || '') + ' ' + s.description + ' ' + (s.descriptionHi || '') + ' ' + (s.need || '') + ' ' + (s.category || '')
      ).toLowerCase();

      // Match need
      if (detectedNeed && s.need && s.need.toLowerCase().includes(detectedNeed.toLowerCase())) {
        score += 20;
      }

      // Match district
      if (detectedDistrict && s.applicableDistricts?.includes(detectedDistrict)) {
        score += 10;
      }

      // Keyword matches
      const tokens = question.split(/[\s,।?.!]+/);
      for (const t of tokens) {
        if (t.length > 2 && sFullText.includes(t.toLowerCase())) {
          score += 4;
        }
      }

      return { scheme: s, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topMatches = scored.filter((x) => x.score > 0).slice(0, 4).map((x) => x.scheme);
    const fallbackMatches = topMatches.length > 0 ? topMatches : allPublished.slice(0, 3);

    return {
      query: question,
      detectedDistrict: detectedDistrict || 'All MP Districts',
      detectedNeed: detectedNeed || 'General Welfare',
      rulesUsed: rulesUsed.length > 0 ? rulesUsed : ['मध्य प्रदेश महिला कल्याण एवं आजीविका योजना प्राथमिकता नियम'],
      matches: fallbackMatches,
      disclaimer: '⚠️ आवश्यक सूचना: यह खोज परिणाम केवल शासकीय नियमों के आधार पर संभावित पात्रता दर्शाते हैं। यह अंतिम स्वीकृति का वादा नहीं है। अंतिम स्वीकृति जिला प्रशासन/कार्यालय के सत्यापन पर निर्भर है।',
      helplineOffer: 'निशुल्क सहायता हेतु हमारी हेल्पलाइन 1800-233-0000 पर संपर्क करें या कॉल-बैक का अनुरोध दर्ज करें।',
    };
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

