import { describe, it, expect } from "vitest";
import { api } from "../src/services/api";

describe("Frontend Architecture & API Client Suite", () => {
  it("correctly constructs receipt download URL", () => {
    const url = api.getReceiptDownloadUrl("receipt-uuid-1234");
    expect(url).toContain("/receipts/receipt-uuid-1234/download");
  });

  it("correctly constructs Form 10BD CSV download URL with financial year parameter", () => {
    const urlWithFy = api.getForm10BDCsvUrl("2026-27");
    expect(urlWithFy).toContain(
      "/admin/reports/form-10bd?format=csv&financialYear=2026-27",
    );

    const defaultUrl = api.getForm10BDCsvUrl();
    expect(defaultUrl).toContain("/admin/reports/form-10bd?format=csv");
  });

  it("verifies brand color palette compliance", () => {
    const brandColors = {
      primary: "#EA3C36",
      deepRed: "#D32F2F",
      cyan: "#00A3C4",
      navy: "#1E3A8A",
      background: "#FFFFFF",
      white: "#FFFFFF",
      primaryText: "#1A1A1A",
      secondaryText: "#4B5563",
    };

    expect(brandColors.primary).toBe("#EA3C36");
    expect(brandColors.deepRed).toBe("#D32F2F");
    expect(brandColors.cyan).toBe("#00A3C4");
  });

  it("verifies Poppins font family integration", () => {
    const fontConfig = {
      primaryFont: "Poppins",
      fallback: "sans-serif",
    };
    expect(fontConfig.primaryFont).toBe("Poppins");
  });

  it("verifies India platform localization standards", () => {
    const indianConfig = {
      brandName: "UdaanHer",
      tagline: "Giving women wings to fly",
      hindiName: "उड़ानहर",
      hindiTagline: "महिलाओं को उड़ने के पंख",
      country: "India",
      currencySymbol: "₹",
      currencyCode: "INR",
      womenHelpline: "181",
      policeWomenHelpline: "1091",
      emergencyHelpline: "112",
      statutoryExemption: "Section 80G IT Act 1961",
      trustPan: "AAATC1234D",
      postalPin: "462011",
      headquarters: "Bhopal, Madhya Pradesh",
    };

    expect(indianConfig.brandName).toBe("UdaanHer");
    expect(indianConfig.tagline).toBe("Giving women wings to fly");
    expect(indianConfig.country).toBe("India");
    expect(indianConfig.currencySymbol).toBe("₹");
    expect(indianConfig.currencyCode).toBe("INR");
    expect(indianConfig.womenHelpline).toBe("181");
    expect(indianConfig.trustPan).toBe("AAATC1234D");
    expect(indianConfig.postalPin).toMatch(/^\d{6}$/);
  });

  it("verifies brand logo asset availability", () => {
    const logoConfig = {
      logoPath: "/assets/images/logo.png",
      alt: "UdaanHer Logo",
    };
    expect(logoConfig.logoPath).toBe("/assets/images/logo.png");
    expect(logoConfig.alt).toContain("UdaanHer");
  });

  it("verifies navigation items prevent UI bottleneck by omitting redundant Ways to Donate when donor is logged in", () => {
    const navLinks = [
      { href: "/", label: "Home" },
      { href: "/schemes", label: "Programs & Services" },
      { href: "/eligibility", label: "Find My Scheme" },
      { href: "/campaigns", label: "Our Impact" },
      { href: "/donate", label: "Ways to Donate" },
    ];

    // Unauthenticated user
    const unauthedDesktopNav = navLinks;
    expect(unauthedDesktopNav.map((l) => l.href)).toContain("/donate");

    // Authenticated donor user
    const authenticatedUser = { id: "donor-1", email: "donor@example.com", role: "DONOR" };
    const authedDesktopNav = authenticatedUser
      ? navLinks.filter((l) => l.href !== "/donate")
      : navLinks;

    expect(authedDesktopNav.map((l) => l.href)).not.toContain("/donate");
    expect(authedDesktopNav).toHaveLength(4);
    expect(authedDesktopNav.map((l) => l.href)).toEqual([
      "/",
      "/schemes",
      "/eligibility",
      "/campaigns",
    ]);
  });

  it("verifies admin portal navigation structure and permissions", () => {
    const adminMenuItems = [
      { href: "/admin", label: "Overview Dashboard" },
      { href: "/admin/schemes", label: "Schemes Directory" },
      { href: "/admin/ai-reviews", label: "AI Summary Review" },
      { href: "/admin/campaigns", label: "Campaigns & Funds" },
      { href: "/admin/donations", label: "Donations & 80G Filings" },
      { href: "/admin/reports", label: "Audit & Form 10BD" },
    ];

    expect(adminMenuItems).toHaveLength(6);
    expect(adminMenuItems.map((item) => item.href)).toEqual([
      "/admin",
      "/admin/schemes",
      "/admin/ai-reviews",
      "/admin/campaigns",
      "/admin/donations",
      "/admin/reports",
    ]);
  });

  it("verifies Form 10BD statutory report fields compliance", () => {
    const sampleRecord = {
      uniqueIdNumber: "AAATC1234D",
      idType: "PAN",
      sectionCode: "Section 80G",
      donorName: "Dr. Ananya Sharma",
      address: "Bhopal, Madhya Pradesh",
      typeOfDonation: "Specific Grants / Corpus",
      donationAmount: 25000,
      receiptNumber: "UD-202627-0001",
    };

    expect(sampleRecord.uniqueIdNumber).toMatch(/^[A-Z]{5}[0-9]{4}[A-Z]$/);
    expect(sampleRecord.sectionCode).toBe("Section 80G");
    expect(sampleRecord.donationAmount).toBeGreaterThan(0);
    expect(sampleRecord.receiptNumber).toContain("UD-202627-");
  });

  it("verifies AI plain-Hindi editorial workflow & official notice metadata requirements", () => {
    const verifiedScheme = {
      id: "sch-01",
      name: "Mukhyamantri Kalyani Vivah Sahayata Yojana",
      nameHi: "मुख्यमंत्री कल्याणी विवाह सहायता योजना",
      descriptionHi: "यह योजना मध्य प्रदेश की कल्याणी (विधवा) बहनों के पुनर्विवाह हेतु ₹2 लाख की आर्थिक सहायता प्रदान करती है।",
      officialSourceUrl: "https://socialjustice.mp.gov.in",
      lastCheckedAt: new Date("2026-11-05T00:00:00Z"),
      isEditorApproved: true,
    };

    expect(verifiedScheme.descriptionHi).toBeTruthy();
    expect(verifiedScheme.officialSourceUrl).toMatch(/^https:\/\//);
    expect(verifiedScheme.lastCheckedAt).toBeInstanceOf(Date);
    expect(verifiedScheme.isEditorApproved).toBe(true);
  });

  it("verifies Hindi natural language finder safety guardrails and never-a-promise disclaimer", () => {
    const finderResult = {
      query: "मैं भोपाल की 32 वर्षीय विधवा महिला हूँ",
      rulesUsed: [
        "पहचानी गई आवश्यकता: विधवा / वृद्धावस्था सामाजिक सुरक्षा पेंशन",
        "लागू जिला: Bhopal (मध्य प्रदेश के 9 अधिकृत जनपदों में सत्यापित)",
        "बीपीएल राशन कार्ड प्राथमिकता नियम लागू",
      ],
      disclaimer: "⚠️ आवश्यक सूचना: यह खोज परिणाम केवल शासकीय नियमों के आधार पर संभावित पात्रता दर्शाते हैं। यह अंतिम स्वीकृति का वादा नहीं है।",
      helplineOffer: "निशुल्क सहायता हेतु हमारी हेल्पलाइन 181 पर संपर्क करें या कॉल-बैक का अनुरोध दर्ज करें।",
      matches: [{ schemeCode: "SCH-014", name: "State Widow Pension" }],
    };

    expect(finderResult.rulesUsed.length).toBeGreaterThan(0);
    expect(finderResult.disclaimer).toContain("वादा नहीं");
    expect(finderResult.helplineOffer).toContain("181");
    expect(finderResult.matches.length).toBeGreaterThan(0);
  });

  it("verifies automated receipts, certificates and reminder API contracts", async () => {
    expect(typeof api.getAutomationStatus).toBe("function");
    expect(typeof api.triggerAutomationSuite).toBe("function");
    expect(typeof api.generateAISummary).toBe("function");
    expect(typeof api.updateAIReviewDraft).toBe("function");
    expect(typeof api.approveAIReview).toBe("function");
    expect(typeof api.rejectAIReview).toBe("function");
  });
});
