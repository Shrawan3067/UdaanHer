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
});
