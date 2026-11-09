import PDFDocument from "pdfkit";
import { Readable } from "stream";
import { amountInWords } from "../../utils/number-to-words.js";

export interface ReceiptPdfData {
  receiptNumber: string;
  financialYear: string;
  issueDate: Date;
  donorName: string;
  donorPAN: string;
  donorAddress?: string;
  donorEmail?: string;
  donationAmount: number;
  paymentMethod: string;
  transactionReference: string;
  campaignTitle: string;
  trustName: string;
  trustAddress: string;
  trustPAN: string;
  trust80GRegistrationNumber: string;
}

export class ReceiptPdfGenerator {
  /**
   * Generates a PDFKit document stream for the 80G donation receipt.
   */
  generatePdfStream(data: ReceiptPdfData): PDFKit.PDFDocument {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      info: {
        Title: `Donation Receipt ${data.receiptNumber}`,
        Author: data.trustName,
        Subject: "80G Donation Receipt (Demonstration Document)",
      },
    });

    const primaryColor = "#174C3C"; // Brand Forest Green
    const terracottaColor = "#C77B59";
    const darkGray = "#202923";
    const mutedGray = "#6B7280";
    const lightBg = "#F3F4F1";

    // 1. Watermark Notice Header
    doc.rect(40, 35, 515, 24).fill("#FEF3C7");
    doc
      .fontSize(8.5)
      .fillColor("#92400E")
      .font("Helvetica-Bold")
      .text(
        "DEMONSTRATION DOCUMENT — NOT A VALID TAX CERTIFICATE — FOR CODE REVIEW / EVALUATION ONLY",
        45,
        42,
        { width: 505, align: "center" },
      );

    // 2. Trust Header & Title
    doc
      .fontSize(18)
      .fillColor(primaryColor)
      .font("Helvetica-Bold")
      .text("UDAANHER CHARITABLE TRUST", 40, 75, { align: "center" });

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(darkGray)
      .text(
        "UdaanHer: Giving women wings to fly • Empowering Women across India",
        { align: "center" },
      );

    doc
      .fontSize(8.5)
      .fillColor(mutedGray)
      .text(data.trustAddress, { align: "center" })
      .text(
        `Trust PAN: ${data.trustPAN}  |  80G Registration No: ${data.trust80GRegistrationNumber}`,
        {
          align: "center",
        },
      );

    // Divider Line
    doc
      .moveTo(40, 130)
      .lineTo(555, 130)
      .strokeColor(primaryColor)
      .lineWidth(1.5)
      .stroke();

    // 3. Receipt Badge & Certificate Title
    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("DONATION RECEIPT & 80G CERTIFICATE", 40, 142, { align: "center" });

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(mutedGray)
      .text(
        "(Under Section 80G(5)(vi) of the Income Tax Act, 1961 - Demo Simulated)",
        {
          align: "center",
        },
      );

    // 4. Receipt Metadata Box
    const metaY = 175;
    doc.rect(40, metaY, 515, 45).fill(lightBg);

    doc
      .fontSize(9.5)
      .font("Helvetica-Bold")
      .fillColor(darkGray)
      .text("Receipt No:", 55, metaY + 10)
      .font("Helvetica")
      .text(data.receiptNumber, 125, metaY + 10)
      .font("Helvetica-Bold")
      .text("Financial Year:", 340, metaY + 10)
      .font("Helvetica")
      .text(data.financialYear, 420, metaY + 10);

    const formattedDate = new Date(data.issueDate).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    doc
      .font("Helvetica-Bold")
      .text("Date of Issue:", 55, metaY + 26)
      .font("Helvetica")
      .text(formattedDate, 125, metaY + 26)
      .font("Helvetica-Bold")
      .text("Mode of Payment:", 340, metaY + 26)
      .font("Helvetica")
      .text(data.paymentMethod, 440, metaY + 26);

    // 5. Donor & Donation Details Table
    const tableTop = 235;

    // Header bar
    doc.rect(40, tableTop, 515, 20).fill(primaryColor);
    doc
      .fontSize(9.5)
      .font("Helvetica-Bold")
      .fillColor("#FFFFFF")
      .text("PARTICULARS", 55, tableTop + 5)
      .text("DETAILS", 260, tableTop + 5);

    const rows = [
      { label: "Received With Thanks From", value: data.donorName },
      { label: "Donor Permanent Account Number (PAN)", value: data.donorPAN },
      { label: "Donor Address", value: data.donorAddress || "Not Provided" },
      { label: "Campaign / Cause Supported", value: data.campaignTitle },
      {
        label: "Payment Reference / Transaction ID",
        value: data.transactionReference,
      },
      {
        label: "Donation Amount (in Figures)",
        value: `INR ₹${Number(data.donationAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      },
      {
        label: "Donation Amount (in Words)",
        value: amountInWords(data.donationAmount),
      },
    ];

    let currentY = tableTop + 20;

    rows.forEach((row, index) => {
      const isEven = index % 2 === 0;
      const rowHeight =
        row.label.includes("Address") || row.label.includes("Words") ? 28 : 22;

      if (isEven) {
        doc.rect(40, currentY, 515, rowHeight).fill("#FBFBFA");
      }

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(darkGray)
        .text(row.label, 55, currentY + 6, { width: 195 });

      doc
        .font("Helvetica")
        .fillColor(row.label.includes("Figures") ? primaryColor : darkGray)
        .text(row.value, 260, currentY + 6, { width: 285 });

      // horizontal line
      doc
        .moveTo(40, currentY + rowHeight)
        .lineTo(555, currentY + rowHeight)
        .strokeColor("#E5E7EB")
        .lineWidth(0.5)
        .stroke();

      currentY += rowHeight;
    });

    // 6. 80G Statutory Exemption Note
    const noteY = currentY + 20;
    doc.rect(40, noteY, 515, 70).strokeColor("#CBD5E1").lineWidth(0.8).stroke();

    doc
      .fontSize(8.5)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("Statutory Tax Exemption Note & Declarations:", 50, noteY + 8);

    doc
      .fontSize(7.8)
      .font("Helvetica")
      .fillColor(mutedGray)
      .text(
        "1. Donations made to UdaanHer are eligible for 50% deduction under Section 80G of the Indian Income Tax Act, 1961.\n" +
          "2. This receipt is digitally generated upon verified confirmation of payment.\n" +
          "3. As per Section 10BD requirements, donor PAN and full address are registered for Form 10BD electronic annual filing.\n" +
          "4. No goods or services were provided in exchange for this charitable contribution.",
        50,
        noteY + 22,
        { width: 495, lineGap: 2 },
      );

    // 7. Signature & Seal Area
    const signY = noteY + 95;

    doc
      .rect(55, signY, 130, 48)
      .strokeColor("#94A3B8")
      .dash(3, { space: 2 })
      .stroke();
    doc.undash();

    doc
      .fontSize(7.5)
      .font("Helvetica-Bold")
      .fillColor(terracottaColor)
      .text("UDAANHER CHARITABLE TRUST", 60, signY + 12, {
        width: 120,
        align: "center",
      })
      .text("TRUST OFFICIAL SEAL", 60, signY + 26, {
        width: 120,
        align: "center",
      });

    doc
      .moveTo(380, signY + 36)
      .lineTo(530, signY + 36)
      .strokeColor(darkGray)
      .lineWidth(0.8)
      .stroke();

    doc
      .fontSize(8.5)
      .font("Helvetica-Bold")
      .fillColor(darkGray)
      .text("Authorized Signatory", 380, signY + 40, {
        width: 150,
        align: "center",
      })
      .fontSize(7.5)
      .font("Helvetica")
      .fillColor(mutedGray)
      .text("UdaanHer Charitable Trust (Bhopal)", 380, signY + 52, {
        width: 150,
        align: "center",
      });

    // 8. Footer
    doc
      .fontSize(7.5)
      .font("Helvetica")
      .fillColor(mutedGray)
      .text(
        `Generated on ${new Date().toISOString()} | Unique Doc ID: ${data.receiptNumber} | Client: Company A`,
        40,
        780,
        { align: "center", width: 515 },
      );

    doc.end();
    return doc;
  }
}

export const receiptPdfGenerator = new ReceiptPdfGenerator();
