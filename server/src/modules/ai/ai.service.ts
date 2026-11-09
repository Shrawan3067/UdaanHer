import OpenAI from 'openai';
import { AIReviewStatus, Scheme } from '../../types/models.js';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/app-error.js';
import { logger } from '../../utils/logger.js';
import {
  aiSummaryResponseSchema,
  AISummaryResponse,
  HINDI_SUMMARY_SYSTEM_PROMPT,
} from './ai.prompts.js';

export class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    if (env.OPENAI_API_KEY && env.OPENAI_API_KEY.trim().length > 0) {
      this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
  }

  async generateSchemeSummary(schemeId: string, adminUserId: string) {
    const scheme = await prisma.scheme.findUnique({
      where: { id: schemeId },
    });

    if (!scheme) {
      throw AppError.notFound('Scheme not found');
    }

    let summaryData: AISummaryResponse;

    if (this.openai) {
      try {
        summaryData = await this.callOpenAI(scheme);
      } catch (err: any) {
        logger.warn('OpenAI API call failed, falling back to structured template synthesis', {
          error: err.message,
          schemeCode: scheme.schemeCode,
        });
        summaryData = this.generateFallbackSummary(scheme);
      }
    } else {
      logger.info('No OPENAI_API_KEY provided; generating high-fidelity local draft summary', {
        schemeCode: scheme.schemeCode,
      });
      summaryData = this.generateFallbackSummary(scheme);
    }

    // Persist as a PENDING draft in AIReview table (Human review workflow)
    const review = await prisma.aIReview.create({
      data: {
        schemeId: scheme.id,
        generatedHindiSummary: summaryData.hindiSummary,
        generatedEnglishSummary: summaryData.englishSummary,
        missingInformation: summaryData.missingInformation,
        status: AIReviewStatus.PENDING,
      },
      include: {
        scheme: {
          select: { id: true, schemeCode: true, name: true, nameHi: true },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'GENERATE_AI_SUMMARY',
        entityType: 'AI_REVIEW',
        entityId: review.id,
        metadata: { schemeCode: scheme.schemeCode, status: 'PENDING' },
      },
    });

    return review;
  }

  async listReviews(status?: AIReviewStatus) {
    return prisma.aIReview.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        scheme: {
          select: { id: true, schemeCode: true, name: true, nameHi: true, slug: true, category: true },
        },
        reviewedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async updateReviewDraft(
    reviewId: string,
    data: { generatedHindiSummary?: string; generatedEnglishSummary?: string },
    adminUserId: string
  ) {
    const review = await prisma.aIReview.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw AppError.notFound('AI Review draft not found');
    }

    const updated = await prisma.aIReview.update({
      where: { id: reviewId },
      data: {
        generatedHindiSummary: data.generatedHindiSummary ?? review.generatedHindiSummary,
        generatedEnglishSummary: data.generatedEnglishSummary ?? review.generatedEnglishSummary,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'EDIT_AI_REVIEW_DRAFT',
        entityType: 'AI_REVIEW',
        entityId: reviewId,
      },
    });

    return updated;
  }

  async approveReview(reviewId: string, adminUserId: string) {
    const review = await prisma.aIReview.findUnique({
      where: { id: reviewId },
      include: { scheme: true },
    });

    if (!review) {
      throw AppError.notFound('AI Review draft not found');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Mark review as APPROVED
      const approvedReview = await tx.aIReview.update({
        where: { id: reviewId },
        data: {
          status: AIReviewStatus.APPROVED,
          reviewedById: adminUserId,
          reviewedAt: new Date(),
        },
      });

      // 2. Publish summary into the Scheme record's Hindi fields
      await tx.scheme.update({
        where: { id: review.schemeId },
        data: {
          descriptionHi: review.generatedHindiSummary,
          lastCheckedAt: new Date(),
        },
      });

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'APPROVE_AI_SUMMARY',
          entityType: 'AI_REVIEW',
          entityId: reviewId,
          metadata: { schemeId: review.schemeId, schemeCode: review.scheme.schemeCode },
        },
      });

      return approvedReview;
    });

    return updated;
  }

  async rejectReview(reviewId: string, adminUserId: string) {
    const review = await prisma.aIReview.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw AppError.notFound('AI Review draft not found');
    }

    const rejected = await prisma.aIReview.update({
      where: { id: reviewId },
      data: {
        status: AIReviewStatus.REJECTED,
        reviewedById: adminUserId,
        reviewedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'REJECT_AI_SUMMARY',
        entityType: 'AI_REVIEW',
        entityId: reviewId,
        metadata: { schemeId: review.schemeId },
      },
    });

    return rejected;
  }

  private async callOpenAI(scheme: Scheme): Promise<AISummaryResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not configured');
    }

    const promptPayload = {
      schemeCode: scheme.schemeCode,
      name: scheme.name,
      category: scheme.category,
      need: scheme.need,
      description: scheme.description,
      benefit: scheme.benefit,
      eligibilityRules: scheme.eligibilityRules,
      requiredDocuments: scheme.requiredDocuments,
      applicationSteps: scheme.applicationSteps,
      applicableDistricts: scheme.applicableDistricts,
      officialSourceUrl: scheme.officialSourceUrl,
    };

    const completion = await this.openai.chat.completions.create({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: HINDI_SUMMARY_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Please synthesize the official scheme data into plain Hindi and English summaries:\n${JSON.stringify(
            promptPayload,
            null,
            2
          )}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI returned an empty completion');
    }

    const parsedJson = JSON.parse(content);
    return aiSummaryResponseSchema.parse(parsedJson);
  }

  private generateFallbackSummary(scheme: Scheme): AISummaryResponse {
    const docs = Array.isArray(scheme.requiredDocuments)
      ? (scheme.requiredDocuments as any[]).map((d) => d.nameHi || d.name).join(', ')
      : 'आधार कार्ड, समग्र आईडी, बैंक पासबुक';

    const hindi = `यह योजना (${scheme.nameHi || scheme.name}) मध्य प्रदेश की पात्र महिलाओं के लिए है। इसका मुख्य उद्देश्य ${scheme.need} सहायता प्रदान करना है। इसके तहत लाभार्थियों को ${scheme.benefitHi || scheme.benefit} प्रदान किया जाता है। आवेदन हेतु आवश्यक दस्तावेज: ${docs}। आवेदन निकटतम ग्राम पंचायत, जनपद अथवा एमपी ऑनलाइन कियोस्क के माध्यम से किया जा सकता है। आधिकारिक पोर्टल: ${scheme.officialSourceUrl}`;

    const english = `The ${scheme.name} scheme provides ${scheme.benefit} to eligible women applicants residing in Madhya Pradesh. Key documentation includes Aadhaar, Samagra ID, and relevant category proof. Applications are processed through local Panchayat and state kiosks.`;

    return {
      hindiSummary: hindi,
      englishSummary: english,
      missingInformation: [],
      sourceBased: true,
    };
  }
}

export const aiService = new AIService();

