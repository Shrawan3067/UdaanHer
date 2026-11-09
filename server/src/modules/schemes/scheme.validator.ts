import { z } from 'zod';

export const listSchemesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    district: z.string().optional(),
    need: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
    page: z.string().optional().default('1').transform((v) => Math.max(1, parseInt(v, 10) || 1)),
    limit: z.string().optional().default('10').transform((v) => Math.min(50, Math.max(1, parseInt(v, 10) || 10))),
  }),
});

export const createSchemeSchema = z.object({
  body: z.object({
    schemeCode: z.string().min(3, 'Scheme code is required'),
    name: z.string().min(3, 'Scheme name is required'),
    nameHi: z.string().optional(),
    category: z.string().min(2, 'Category is required'),
    need: z.string().min(2, 'Need category is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    descriptionHi: z.string().optional(),
    benefit: z.string().min(5, 'Benefit description is required'),
    benefitHi: z.string().optional(),
    eligibilityRules: z.record(z.any()),
    requiredDocuments: z.array(z.any()).default([]),
    applicationSteps: z.array(z.any()).default([]),
    applicableDistricts: z.array(z.string()).default([]),
    officialSourceUrl: z.string().url('Must be a valid official URL'),
    nearestHelpCentre: z.record(z.any()).optional().default({}),
    lastCheckedAt: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional().default('DRAFT'),
  }),
});

export const updateSchemeSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    schemeCode: z.string().optional(),
    name: z.string().optional(),
    nameHi: z.string().optional(),
    category: z.string().optional(),
    need: z.string().optional(),
    description: z.string().optional(),
    descriptionHi: z.string().optional(),
    benefit: z.string().optional(),
    benefitHi: z.string().optional(),
    eligibilityRules: z.record(z.any()).optional(),
    requiredDocuments: z.array(z.any()).optional(),
    applicationSteps: z.array(z.any()).optional(),
    applicableDistricts: z.array(z.string()).optional(),
    officialSourceUrl: z.string().url().optional(),
    nearestHelpCentre: z.record(z.any()).optional(),
    lastCheckedAt: z.string().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  }),
});

export const askSchemeQuestionSchema = z.object({
  body: z.object({
    question: z.string().min(2, 'Question must be at least 2 characters'),
    district: z.string().optional(),
  }),
});

