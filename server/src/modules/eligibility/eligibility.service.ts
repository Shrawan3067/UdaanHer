import { SchemeStatus } from "../../types/models.js";
import { prisma } from "../../config/database.js";
import { eligibilityEngine, UserProfileAnswers } from "./eligibility.engine.js";

export class EligibilityService {
  async evaluateEligibility(answers: UserProfileAnswers) {
    const publishedSchemes = await prisma.scheme.findMany({
      where: { status: SchemeStatus.PUBLISHED },
    });

    const results = publishedSchemes.map((scheme) =>
      eligibilityEngine.evaluate(scheme, answers),
    );

    const eligibleSchemes = results
      .filter((r) => r.isEligible)
      .sort((a, b) => b.matchScore - a.matchScore);

    const potentialSchemes = results
      .filter((r) => !r.isEligible && r.matchScore >= 50)
      .sort((a, b) => b.matchScore - a.matchScore);

    return {
      answers,
      eligibleSchemes,
      potentialSchemes,
      totalMatched: eligibleSchemes.length,
      evaluatedCount: publishedSchemes.length,
      disclaimer: {
        en: "These matching results are preliminary evaluations based on deterministic state scheme criteria and self-reported answers. UdaanHer does not legally authorize or sanction government welfare benefits. Official verification and sanction rest with respective district welfare authorities.",
        hi: "यह मिलान परिणाम आपके द्वारा दी गई जानकारी और सरकारी मापदंडों पर आधारित प्रारंभिक आकलन है। उड़ानहर सरकारी योजनाओं को स्वीकृत करने का दावा नहीं करता है। अंतिम पात्रता एवं स्वीकृति संबंधित शासकीय विभाग द्वारा की जाती है।",
      },
    };
  }

  async createCallbackRequest(data: {
    name: string;
    phone: string;
    district: string;
    schemeCode?: string;
    notes?: string;
  }) {
    const callback = await prisma.helpRequest.create({
      data: {
        name: data.name,
        phone: data.phone,
        district: data.district,
        schemeCode: data.schemeCode,
        notes: data.notes,
      },
    });

    return {
      id: callback.id,
      name: callback.name,
      phone: callback.phone,
      message:
        "Helpline callback request registered. An UdaanHer field facilitator will contact you within 24-48 business hours.",
    };
  }
}

export const eligibilityService = new EligibilityService();
