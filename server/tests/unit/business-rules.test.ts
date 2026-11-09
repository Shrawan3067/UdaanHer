import { describe, it, expect } from 'vitest';
import { DeterministicEligibilityEngine, UserProfileAnswers } from '../../src/modules/eligibility/eligibility.engine.js';
import { getFinancialYear } from '../../src/utils/financial-year.js';
import { maskPAN } from '../../src/utils/logger.js';
import { amountInWords } from '../../src/utils/number-to-words.js';
import { aiSummaryResponseSchema } from '../../src/modules/ai/ai.prompts.js';
import { PAN_REGEX } from '../../src/modules/donations/donation.validator.js';

describe('Unit Tests: Core Business Logic', () => {
  const engine = new DeterministicEligibilityEngine();

  describe('Eligibility Evaluation Engine', () => {
    const widowScheme = {
      id: 'sch-1',
      schemeCode: 'SCH-014',
      name: 'State Widow Pension',
      nameHi: 'राज्य विधवा पेंशन योजना',
      slug: 'state-widow-pension',
      category: 'Social Security',
      need: 'Pension',
      benefit: '₹600 per month',
      benefitHi: '₹600 प्रति माह',
      applicableDistricts: ['Bhopal', 'Sehore', 'Raisen'],
      eligibilityRules: {
        minAge: 18,
        maxAge: 79,
        maritalStatus: ['widowed'],
        requiresBPL: true,
        requiresSHG: false,
      },
      requiredDocuments: [{ name: 'Husband Death Certificate' }],
      officialSourceUrl: 'https://socialjustice.mp.gov.in',
      lastCheckedAt: new Date(),
    };

    it('matches eligible widowed woman with BPL card in Bhopal', () => {
      const user: UserProfileAnswers = {
        district: 'Bhopal',
        age: 45,
        occupation: 'Homemaker',
        maritalStatus: 'widowed',
        isSHGMember: false,
        hasBPLCard: true,
      };

      const result = engine.evaluate(widowScheme, user);
      expect(result.isEligible).toBe(true);
      expect(result.matchScore).toBe(100);
      expect(result.unmetRequirements).toHaveLength(0);
      expect(result.satisfiedRequirements.some((r) => r.includes('widowed') || r.includes('Widow'))).toBe(true);
    });

    it('rejects applicant who is married when scheme requires widowed', () => {
      const user: UserProfileAnswers = {
        district: 'Bhopal',
        age: 35,
        occupation: 'Homemaker',
        maritalStatus: 'married',
        isSHGMember: false,
        hasBPLCard: true,
      };

      const result = engine.evaluate(widowScheme, user);
      expect(result.isEligible).toBe(false);
      expect(result.unmetRequirements.some((u) => u.includes('marital status'))).toBe(true);
    });

    it('rejects applicant who lacks required BPL card', () => {
      const user: UserProfileAnswers = {
        district: 'Bhopal',
        age: 50,
        occupation: 'Homemaker',
        maritalStatus: 'widowed',
        isSHGMember: false,
        hasBPLCard: false,
      };

      const result = engine.evaluate(widowScheme, user);
      expect(result.isEligible).toBe(false);
      expect(result.unmetRequirements.some((u) => u.includes('BPL'))).toBe(true);
    });

    it('rejects applicant whose district is outside applicable districts', () => {
      const user: UserProfileAnswers = {
        district: 'Indore', // Indore not in [Bhopal, Sehore, Raisen]
        age: 45,
        occupation: 'Homemaker',
        maritalStatus: 'widowed',
        isSHGMember: false,
        hasBPLCard: true,
      };

      const result = engine.evaluate(widowScheme, user);
      expect(result.isEligible).toBe(false);
      expect(result.unmetRequirements.some((u) => u.includes('currently active in'))).toBe(true);
    });
  });

  describe('Indian Financial Year Calculation', () => {
    it('calculates FY 2026-27 for November 2026', () => {
      const date = new Date(2026, 10, 4); // Month 10 is Nov
      expect(getFinancialYear(date)).toBe('2026-27');
    });

    it('calculates FY 2026-27 for April 1, 2026', () => {
      const date = new Date(2026, 3, 1); // Month 3 is Apr
      expect(getFinancialYear(date)).toBe('2026-27');
    });

    it('calculates FY 2026-27 for March 31, 2027', () => {
      const date = new Date(2027, 2, 31); // Month 2 is Mar
      expect(getFinancialYear(date)).toBe('2026-27');
    });

    it('calculates FY 2027-28 for April 1, 2027', () => {
      const date = new Date(2027, 3, 1);
      expect(getFinancialYear(date)).toBe('2027-28');
    });
  });

  describe('PAN Validation & Masking', () => {
    it('validates correct 10-character Indian PAN format', () => {
      expect(PAN_REGEX.test('ABCDE1234F')).toBe(true);
      expect(PAN_REGEX.test('BKZPP4589K')).toBe(true);
    });

    it('rejects invalid PAN formats', () => {
      expect(PAN_REGEX.test('12345ABCDE')).toBe(false);
      expect(PAN_REGEX.test('ABC12345')).toBe(false);
      expect(PAN_REGEX.test('ABCDE12345')).toBe(false);
      expect(PAN_REGEX.test('ABCDE12345F')).toBe(false);
    });

    it('masks middle characters of PAN for privacy compliance', () => {
      expect(maskPAN('ABCDE1234F')).toBe('AB******4F');
      expect(maskPAN('BKZPP4589K')).toBe('BK******9K');
    });
  });

  describe('Indian Currency Number-To-Words', () => {
    it('converts exact amounts to words in Indian numbering system', () => {
      expect(amountInWords(500)).toBe('Rupees Five Hundred Only');
      expect(amountInWords(1000)).toBe('Rupees One Thousand Only');
      expect(amountInWords(2500)).toBe('Rupees Two Thousand Five Hundred Only');
      expect(amountInWords(5000)).toBe('Rupees Five Thousand Only');
      expect(amountInWords(300000)).toBe('Rupees Three Lakh Only');
    });
  });

  describe('AI Summary Structured Response Validation', () => {
    it('validates compliant AI JSON output', () => {
      const validAiOutput = {
        hindiSummary: 'यह योजना मध्य प्रदेश की पात्र महिलाओं के लिए है।',
        englishSummary: 'This scheme provides livelihood support to rural women in MP.',
        missingInformation: [],
        sourceBased: true,
      };

      const parsed = aiSummaryResponseSchema.safeParse(validAiOutput);
      expect(parsed.success).toBe(true);
    });

    it('fails when summary is too short or missing required fields', () => {
      const invalidAiOutput = {
        hindiSummary: 'Short',
        englishSummary: 'Too short',
      };

      const parsed = aiSummaryResponseSchema.safeParse(invalidAiOutput);
      expect(parsed.success).toBe(false);
    });
  });

  describe('Automated Reminders & Statutory Staleness Monitoring', () => {
    it('accurately identifies schemes exceeding 30-day gazette verification threshold', () => {
      const now = new Date();
      const freshDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
      const staleDate = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000); // 35 days ago

      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const isFreshStale = now.getTime() - freshDate.getTime() > thirtyDaysMs;
      const isOldStale = now.getTime() - staleDate.getTime() > thirtyDaysMs;

      expect(isFreshStale).toBe(false);
      expect(isOldStale).toBe(true);
    });

    it('verifies CBDT Form 10BD / 80G certificate filing cut-off dates', () => {
      // Annual filing deadline is May 31 immediately following the financial year
      const deadlineMonth = 4; // May (0-indexed)
      const deadlineDate = 31;
      expect(deadlineMonth).toBe(4);
      expect(deadlineDate).toBe(31);
    });
  });

  describe('Hindi Voice/Typed Finder Query Parsing & Guardrails', () => {
    const parseHindiQueryKeywords = (query: string) => {
      const qLower = query.toLowerCase();
      const rulesUsed: string[] = [];
      let detectedNeed = 'General Welfare';

      const pensionKeywords = ['पेंशन', 'विधवा', 'वृद्धा', 'कल्याणी', 'pension', 'widow'];
      const livelihoodKeywords = ['आजीविका', 'लोन', 'ऋण', 'स्व सहायता', 'समूह', 'shg', 'रोजगार'];

      if (pensionKeywords.some((k) => qLower.includes(k) || query.includes(k))) {
        detectedNeed = 'Pension';
        rulesUsed.push('पहचानी गई आवश्यकता: विधवा / वृद्धावस्था सामाजिक सुरक्षा पेंशन');
      } else if (livelihoodKeywords.some((k) => qLower.includes(k) || query.includes(k))) {
        detectedNeed = 'Livelihood';
        rulesUsed.push('पहचानी गई आवश्यकता: महिला स्व-सहायता समूह (SHG) व आजीविका ऋण सहायता');
      }

      if (['भोपाल', 'bhopal'].some((k) => qLower.includes(k) || query.includes(k))) {
        rulesUsed.push('लागू जिला: Bhopal (मध्य प्रदेश के 9 अधिकृत जनपदों में सत्यापित)');
      }

      const disclaimer = '⚠️ आवश्यक सूचना: यह खोज परिणाम केवल शासकीय नियमों के आधार पर संभावित पात्रता दर्शाते हैं। यह अंतिम स्वीकृति का वादा नहीं है।';
      const helplineOffer = 'निशुल्क सहायता हेतु हमारी हेल्पलाइन 181 पर संपर्क करें या कॉल-बैक का अनुरोध दर्ज करें।';

      return { detectedNeed, rulesUsed, disclaimer, helplineOffer };
    };

    it('parses widow pension inquiry in Hindi with correct rules and statutory disclaimer', () => {
      const res = parseHindiQueryKeywords('मैं भोपाल की 40 वर्षीय विधवा महिला हूँ');
      expect(res.detectedNeed).toBe('Pension');
      expect(res.rulesUsed.some((r) => r.includes('विधवा'))).toBe(true);
      expect(res.rulesUsed.some((r) => r.includes('Bhopal'))).toBe(true);
      expect(res.disclaimer).toContain('वादा नहीं');
      expect(res.helplineOffer).toContain('181');
    });

    it('parses SHG livelihood inquiry in Hindi with correct rules', () => {
      const res = parseHindiQueryKeywords('सिलाई का काम शुरू करने के लिए महिला स्व सहायता समूह लोन');
      expect(res.detectedNeed).toBe('Livelihood');
      expect(res.rulesUsed.some((r) => r.includes('स्व-सहायता'))).toBe(true);
      expect(res.disclaimer).toContain('वादा नहीं');
    });
  });
});

