/**
 * UdaanHer Database Seeding Script (Native MongoDB Atlas)
 * Giving women wings to fly
 */
import bcrypt from "bcryptjs";
import { prisma } from "../config/database.js";
import {
  Role,
  Language,
  SchemeStatus,
  CampaignStatus,
  DonationType,
  DonationStatus,
  PaymentStatus,
  HelpRequestStatus,
  AIReviewStatus,
} from "../types/models.js";

async function main() {
  console.log(
    "🌱 Starting database seeding for UdaanHer: Giving women wings to fly (MongoDB Atlas)...",
  );

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.aIReview.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.scheme.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.receiptSequence.deleteMany();

  console.log("🧹 Cleaned existing database records.");

  // 2. Seed Receipt Sequence for FY 2026-27
  const currentFY = "2026-27";
  await prisma.receiptSequence.create({
    data: {
      financialYear: currentFY,
      nextNumber: 3, // 1, 2, 3 are used for seeded donations, next allocation will increment to 4
    },
  });

  // 3. Seed Users (1 Admin, 2 Donors)
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("Admin@123456", salt);
  const donorPasswordHash = await bcrypt.hash("Donor@123456", salt);

  const admin = await prisma.user.create({
    data: {
      fullName: "Trust Operations Admin",
      email: "admin@udaanher.org",
      phone: "+91 98260 12345",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      preferredLanguage: Language.HI,
      isActive: true,
    },
  });

  const donor1 = await prisma.user.create({
    data: {
      fullName: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 94250 88776",
      passwordHash: donorPasswordHash,
      role: Role.DONOR,
      preferredLanguage: Language.HI,
      isActive: true,
    },
  });

  const donor2 = await prisma.user.create({
    data: {
      fullName: "Rajesh Patel",
      email: "rajesh.patel@example.com",
      phone: "+91 98930 44321",
      passwordHash: donorPasswordHash,
      role: Role.DONOR,
      preferredLanguage: Language.EN,
      isActive: true,
    },
  });

  console.log("👤 Created demo accounts (1 Admin, 2 Donors).");

  // 4. Seed Campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      title: "Rural Women Micro-Enterprises & SHG Seed Fund",
      slug: "rural-women-micro-enterprises-shg",
      category: "Livelihood",
      description:
        "Providing catalytic revolving micro-capital and digital accounting training to 500 women-led Self-Help Groups in Sehore and Raisen districts to start organic spice and poultry processing units.",
      imageUrl:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
      goalAmount: 1000000,
      collectedAmount: 650000,
      startDate: new Date("2026-04-01"),
      endDate: new Date("2027-03-31"),
      status: CampaignStatus.ACTIVE,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      title: "Maternal Nutrition & Healthcare Kits for Rural Mothers",
      slug: "maternal-nutrition-rural-mothers",
      category: "Healthcare",
      description:
        "Delivering nutritional supplement baskets, iron-folic acid packs, and mobile check-up camps for 1,200 expectant and nursing mothers in remote tribal pockets of Betul and Harda.",
      imageUrl:
        "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
      goalAmount: 500000,
      collectedAmount: 380000,
      startDate: new Date("2026-05-15"),
      endDate: new Date("2026-12-31"),
      status: CampaignStatus.ACTIVE,
    },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      title: "Digital Literacy & Rights Caravan across 9 MP Districts",
      slug: "digital-literacy-rights-caravan",
      category: "Education & Rights",
      description:
        "Mobile tech-van equipped with tablets and trained UdaanHer volunteers visiting 180 villages to teach grassroots women digital financial literacy, DigiLocker, and welfare scheme navigation.",
      imageUrl:
        "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1200&q=80",
      goalAmount: 800000,
      collectedAmount: 420000,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2027-01-31"),
      status: CampaignStatus.ACTIVE,
    },
  });

  console.log("🎯 Seeded 3 High-Impact Welfare Campaigns.");

  // 5. Seed Client Sample Schemes + Additional MP Schemes
  const mpDistricts = [
    "Bhopal",
    "Sehore",
    "Raisen",
    "Rajgarh",
    "Vidisha",
    "Hoshangabad",
    "Harda",
    "Betul",
    "Guna",
  ];

  // SCH-014: State Widow Pension
  const scheme14 = await prisma.scheme.create({
    data: {
      schemeCode: "SCH-014",
      name: "State Widow Pension Scheme (Indira Gandhi National Widow Pension)",
      nameHi:
        "राज्य विधवा पेंशन योजना (इंदिरा गांधी राष्ट्रीय विधवा पेंशन योजना)",
      slug: "state-widow-pension-sch-014",
      category: "Social Security",
      need: "Pension",
      description:
        "Monthly financial assistance to widowed women living below the poverty line to ensure financial independence, dignity, and basic nutritional sustenance.",
      descriptionHi:
        "गरीबी रेखा से नीचे जीवनयापन करने वाली विधवा महिलाओं को सामाजिक सुरक्षा, सम्मान और मूलभूत आवश्यकताओं की पूर्ति हेतु मासिक आर्थिक सहायता।",
      benefit:
        "₹600 per month directly credited to the beneficiary bank account.",
      benefitHi:
        "₹600 प्रति माह सीधे लाभार्थी के बैंक खाते में डीबीटी (DBT) के माध्यम से।",
      eligibilityRules: {
        minAge: 18,
        maxAge: 79,
        maritalStatus: ["widowed"],
        requiresBPL: true,
        requiresSHG: false,
        allowedOccupations: ["all"],
        notes:
          "Applicant must be a widow residing in Madhya Pradesh holding a valid BPL card and aged between 18 and 79 years.",
      },
      requiredDocuments: [
        {
          name: "Husband Death Certificate",
          nameHi: "पति का मृत्यु प्रमाण पत्र",
          required: true,
        },
        {
          name: "BPL Ration Card / Samagra ID",
          nameHi: "बीपीएल राशन कार्ड / समग्र आईडी",
          required: true,
        },
        { name: "Aadhaar Card", nameHi: "आधार कार्ड", required: true },
        {
          name: "Bank Passbook copy linked with Aadhaar",
          nameHi: "बैंक पासबुक (आधार से लिंक)",
          required: true,
        },
        {
          name: "Age Proof Certificate",
          nameHi: "आयु प्रमाण पत्र",
          required: true,
        },
      ],
      applicationSteps: [
        {
          step: 1,
          title: "Visit Gram Panchayat / Ward Office",
          description:
            "Collect and fill Form-1 from the local Panchayat secretary or MP Online Kiosk.",
        },
        {
          step: 2,
          title: "Attach Documents",
          description:
            "Attach notarized copy of death certificate, BPL card, and Aadhaar-linked bank details.",
        },
        {
          step: 3,
          title: "Verification by Janpad Panchayat",
          description:
            "Document verification by the Janpad Panchayat Social Welfare Officer within 21 days.",
        },
        {
          step: 4,
          title: "Sanction and First Disbursement",
          description:
            "Approval order issued and monthly pension disbursed directly into the savings bank account.",
        },
      ],
      applicableDistricts: mpDistricts,
      officialSourceUrl: "https://socialjustice.mp.gov.in",
      nearestHelpCentre: {
        name: "District Social Justice & Disabled Welfare Office",
        address: "Collectorate Complex, Arera Hills, Bhopal",
        phone: "0755-2551234",
        email: "socialjustice.bhopal@mp.gov.in",
      },
      lastCheckedAt: new Date("2026-09-12"),
      status: SchemeStatus.PUBLISHED,
    },
  });

  // SCH-022: Self-help group loan support
  await prisma.scheme.create({
    data: {
      schemeCode: "SCH-022",
      name: "Deendayal Antyodaya Yojana - SHG Livelihood Loan Support",
      nameHi:
        "दीनदयाल अंत्योदय योजना - म.प्र. राज्य ग्रामीण आजीविका मिशन (स्व-सहायता समूह ऋण सहायता)",
      slug: "shg-livelihood-loan-support-sch-022",
      category: "Livelihood & Finance",
      need: "Livelihood",
      description:
        "Collateral-free low-interest bank linkage credit support up to ₹3 Lakh for registered women Self-Help Groups (SHGs) to establish micro-enterprises, agri-allied units, and artisanal trades.",
      descriptionHi:
        "पंजीकृत महिला स्व-सहायता समूहों (SHGs) को लघु उद्यम, कृषि-संबद्ध कार्य एवं हस्तशिल्प व्यापार शुरू करने हेतु ₹3 लाख तक का ब्याज अनुदान युक्त आसान बैंक ऋण।",
      benefit:
        "Collateral-free bank credit linkage up to ₹3 lakh with 7% interest subvention.",
      benefitHi:
        "बिना किसी बंधक के ₹3 लाख तक का आसान बैंक लिंकेज ऋण एवं 7% ब्याज अनुदान।",
      eligibilityRules: {
        minAge: 18,
        maxAge: 65,
        maritalStatus: ["all"],
        requiresBPL: false,
        requiresSHG: true,
        allowedOccupations: ["all"],
        notes:
          "Woman must be an active member of a registered SHG operating continuously for at least 6 months with regular savings and internal lending records.",
      },
      requiredDocuments: [
        {
          name: "SHG Registration Certificate & Resolution",
          nameHi: "समूह का पंजीकरण प्रमाण पत्र व प्रस्ताव प्रति",
          required: true,
        },
        {
          name: "SHG Bank Account Passbook (6-month statement)",
          nameHi: "समूह बैंक खाते का 6 माह का विवरण",
          required: true,
        },
        {
          name: "Individual Member Aadhaar & Samagra ID",
          nameHi: "सदस्य का आधार कार्ड एवं समग्र आईडी",
          required: true,
        },
        {
          name: "Micro-Investment Business Plan (MIP)",
          nameHi: "सूक्ष्म-निवेश व्यवसाय योजना (MIP)",
          required: true,
        },
      ],
      applicationSteps: [
        {
          step: 1,
          title: "Pass SHG Internal Resolution",
          description:
            "Group discusses and records a formal loan resolution in its register.",
        },
        {
          step: 2,
          title: "Submit to Cluster Resource Center (CLF)",
          description:
            "Submit the Micro Investment Plan to the Block Project Manager (BPM) SRLM.",
        },
        {
          step: 3,
          title: "Bank Appraisal & Sanction",
          description:
            "Partner bank verifies the SHG grading and sanctions the credit limit.",
        },
        {
          step: 4,
          title: "Disbursement & Mentorship",
          description:
            "Funds transferred to group account with ongoing technical support by UdaanHer field animators.",
        },
      ],
      applicableDistricts: mpDistricts,
      officialSourceUrl: "https://mpdayrlm.org",
      nearestHelpCentre: {
        name: "Madhya Pradesh State Rural Livelihoods Mission (MPSRLM) District Office",
        address: "Zila Panchayat Bhavan, Jail Road, Bhopal",
        phone: "0755-2765432",
        email: "bhopal.srlm@mp.gov.in",
      },
      lastCheckedAt: new Date("2026-08-30"),
      status: SchemeStatus.PUBLISHED,
    },
  });

  // SCH-031: Maternity cash benefit
  await prisma.scheme.create({
    data: {
      schemeCode: "SCH-031",
      name: "Pradhan Mantri Matru Vandana Yojana (PMMVY Maternity Benefit)",
      nameHi: "प्रधानमंत्री मातृ वंदना योजना (PMMVY मातृत्व सहायता)",
      slug: "maternity-cash-benefit-pmmvy-sch-031",
      category: "Healthcare & Nutrition",
      need: "Health",
      description:
        "Cash incentive of ₹5,000 provided directly into the bank accounts of pregnant and lactating mothers for the first live birth to compensate for wage loss and promote institutional nutrition and delivery.",
      descriptionHi:
        "गर्भवती एवं धात्री माताओं को प्रथम जीवित संतान हेतु ₹5,000 की नकद सहायता, जिससे मजदूरी की क्षतिपूर्ति हो सके और संस्थागत प्रसव व उचित पोषण सुनिश्चित हो।",
      benefit:
        "₹5,000 cash incentive in direct DBT instalments on meeting health milestones.",
      benefitHi:
        "स्वास्थ्य एवं टीकाकरण चरणों के आधार पर ₹5,000 की नकद प्रोत्साहन राशि सीधे खाते में।",
      eligibilityRules: {
        minAge: 19,
        maxAge: 45,
        maritalStatus: ["married"],
        requiresBPL: false,
        requiresSHG: false,
        requiresPregnantOrNewMother: true,
        allowedOccupations: ["all"],
        notes:
          "Pregnant women and lactating mothers who are carrying their first live child. (Women in regular government employment are not eligible).",
      },
      requiredDocuments: [
        {
          name: "Mother & Child Protection (MCP) Card",
          nameHi: "मातृ एवं शिशु सुरक्षा (MCP) कार्ड",
          required: true,
        },
        {
          name: "Aadhaar Card of Mother and Husband",
          nameHi: "माता और पति का आधार कार्ड",
          required: true,
        },
        {
          name: "Aadhaar-seeded Bank Account Passbook",
          nameHi: "आधार से लिंक बैंक पासबुक",
          required: true,
        },
        {
          name: "LMP (Last Menstrual Period) Registration Slip",
          nameHi: "एएनएम / आशा कार्यकर्ता द्वारा जारी पंजीकरण पर्ची",
          required: true,
        },
      ],
      applicationSteps: [
        {
          step: 1,
          title: "Register at Anganwadi Centre",
          description:
            "Register pregnancy at the local Anganwadi Centre (AWC) within 150 days of LMP.",
        },
        {
          step: 2,
          title: "First Antenatal Check-up (ANC)",
          description:
            "Receive ₹3,000 after completing at least one antenatal checkup.",
        },
        {
          step: 3,
          title: "Child Birth & First Vaccine Cycle",
          description:
            "Receive ₹2,000 after institutional birth registration and completion of BCG, OPV, and DPT-1 immunizations.",
        },
      ],
      applicableDistricts: mpDistricts,
      officialSourceUrl: "https://wcd.nic.in/pmmvy",
      nearestHelpCentre: {
        name: "Integrated Child Development Services (ICDS) Project Office",
        address: "Sector 3, MP Nagar, Bhopal",
        phone: "0755-2578901",
        email: "icds.bhopal@mp.gov.in",
      },
      lastCheckedAt: new Date("2026-10-05"),
      status: SchemeStatus.PUBLISHED,
    },
  });

  // Additional MP Scheme 1: Mukhya Mantri Ladli Behna Yojana
  await prisma.scheme.create({
    data: {
      schemeCode: "SCH-067",
      name: "Mukhya Mantri Ladli Behna Yojana",
      nameHi: "मुख्यमंत्री लाड़ली बहना योजना",
      slug: "ladli-behna-yojana-sch-067",
      category: "Social Security",
      need: "Livelihood",
      description:
        "Monthly direct financial transfer of ₹1,250 provided to native women of Madhya Pradesh to foster economic autonomy, healthcare choices, and decision-making within the family.",
      descriptionHi:
        "मध्य प्रदेश की पात्र स्थानीय महिलाओं को प्रति माह ₹1,250 की प्रत्यक्ष आर्थिक सहायता ताकि वे आर्थिक रूप से सशक्त बनें और परिवार के निर्णयों में भागीदारी कर सकें।",
      benefit:
        "₹1,250 monthly credited directly via Aadhaar-linked DBT into bank account.",
      benefitHi: "₹1,250 प्रति माह सीधे आधार-लिंक्ड बैंक खाते में।",
      eligibilityRules: {
        minAge: 21,
        maxAge: 60,
        maritalStatus: ["married", "widowed", "divorced"],
        requiresBPL: false,
        requiresSHG: false,
        familyIncomeBelow2Point5Lakh: true,
        allowedOccupations: ["all"],
        notes:
          "Resident of Madhya Pradesh aged 21-60. Annual family income must be under ₹2.5 Lakh with no family member paying income tax or holding government job.",
      },
      requiredDocuments: [
        {
          name: "Samagra Family ID and Member ID",
          nameHi: "समग्र परिवार एवं सदस्य आईडी",
          required: true,
        },
        {
          name: "Aadhaar Card (e-KYC verified)",
          nameHi: "आधार कार्ड (e-KYC पूर्ण)",
          required: true,
        },
        {
          name: "Aadhaar-linked Bank Account with DBT enabled",
          nameHi: "आधार लिंक डीबीटी सक्रिय बैंक खाता",
          required: true,
        },
      ],
      applicationSteps: [
        {
          step: 1,
          title: "Samagra e-KYC Completion",
          description:
            "Complete biometric or OTP-based e-KYC on the Samagra portal.",
        },
        {
          step: 2,
          title: "Form Submission at Gram Panchayat / Ward Camp",
          description:
            "Submit form and live photo at government camp organized in the village/ward.",
        },
        {
          step: 3,
          title: "DBT Credit on 10th of Every Month",
          description:
            "Receive ₹1,250 automatically in bank account every month.",
        },
      ],
      applicableDistricts: mpDistricts,
      officialSourceUrl: "https://cmladlibahna.mp.gov.in",
      nearestHelpCentre: {
        name: "Nagar Nigam / Janpad Panchayat Helpdesk",
        address: "Bhopal Municipal Corporation Office, Mata Mandir, Bhopal",
        phone: "0755-2701400",
        email: "ladlibahna.helpdesk@mp.gov.in",
      },
      lastCheckedAt: new Date("2026-10-15"),
      status: SchemeStatus.PUBLISHED,
    },
  });

  // Additional MP Scheme 2: Gaon Ki Beti Yojana
  await prisma.scheme.create({
    data: {
      schemeCode: "SCH-058",
      name: "Gaon Ki Beti Higher Education Scholarship",
      nameHi: "गांव की बेटी योजना (उच्च शिक्षा छात्रवृत्ति)",
      slug: "gaon-ki-beti-scholarship-sch-058",
      category: "Education & Training",
      need: "Education",
      description:
        "Scholarship assistance of ₹500 per month for 10 months annually (₹5,000/yr) awarded to talented rural girls passing Class 12th in First Division to pursue higher college degrees.",
      descriptionHi:
        "ग्रामीण क्षेत्र की प्रतिभाशाली बालिकाओं को जिन्होंने 12वीं कक्षा प्रथम श्रेणी में उत्तीर्ण की हो, उच्च शिक्षा (कॉलेज) प्राप्त करने हेतु ₹500 प्रतिमाह (10 माह तक) छात्रवृत्ति।",
      benefit: "₹5,000 per academic year for undergraduate college studies.",
      benefitHi: "₹5,000 प्रति शैक्षणिक वर्ष स्नातक (UG) डिग्री हेतु।",
      eligibilityRules: {
        minAge: 17,
        maxAge: 25,
        maritalStatus: ["unmarried", "married"],
        requiresBPL: false,
        requiresSHG: false,
        allowedOccupations: ["student"],
        notes:
          "Girl student from rural Madhya Pradesh passing Class 12 with 60% or above marks enrolled in regular undergraduate college courses.",
      },
      requiredDocuments: [
        {
          name: "Class 12th Marksheet (First Division)",
          nameHi: "12वीं कक्षा की अंकसूची (प्रथम श्रेणी)",
          required: true,
        },
        {
          name: "Rural Certificate (Gaon Ki Beti Praman Patra)",
          nameHi: "गांव की बेटी प्रमाण पत्र (ग्राम पंचायत द्वारा जारी)",
          required: true,
        },
        {
          name: "College Admission Receipt",
          nameHi: "कॉलेज प्रवेश शुल्क रसीद",
          required: true,
        },
        {
          name: "Samagra ID and Bank Passbook",
          nameHi: "समग्र आईडी एवं बैंक पासबुक",
          required: true,
        },
      ],
      applicationSteps: [
        {
          step: 1,
          title: "Obtain Rural Certificate",
          description:
            "Obtain certificate from Sarpanch/Panchayat Secretary verifying rural village residency.",
        },
        {
          step: 2,
          title: "Apply on State Scholarship Portal 2.0",
          description:
            "Register on scholarshipportal.mp.nic.in with Samagra and Aadhaar.",
        },
        {
          step: 3,
          title: "Verification by College Principal",
          description: "College verifies regular admission and course details.",
        },
      ],
      applicableDistricts: mpDistricts,
      officialSourceUrl: "https://scholarshipportal.mp.nic.in",
      nearestHelpCentre: {
        name: "Higher Education Department Regional Office",
        address: "Bhimrao Ambedkar Bhawan, Bhopal",
        phone: "0755-2555666",
        email: "scholarship.hed@mp.gov.in",
      },
      lastCheckedAt: new Date("2026-09-20"),
      status: SchemeStatus.PUBLISHED,
    },
  });

  // Additional Scheme 3: Pradhan Mantri Ujjwala Yojana 2.0
  await prisma.scheme.create({
    data: {
      schemeCode: "SCH-089",
      name: "Pradhan Mantri Ujjwala Yojana 2.0 (Clean Cooking Fuel Connection)",
      nameHi:
        "प्रधानमंत्री उज्ज्वला योजना 2.0 (धुआं-मुक्त स्वच्छ ईंधन रसोई कनेक्शन)",
      slug: "pm-ujjwala-yojana-sch-089",
      category: "Healthcare & Nutrition",
      need: "Health",
      description:
        "Free LPG cooking gas connection along with a stove and first refill cylinder provided in the name of the adult female head of vulnerable poor households to protect respiratory health.",
      descriptionHi:
        "गरीब एवं वंचित परिवारों की वयस्क महिला मुखिया के नाम पर निःशुल्क एलपीजी गैस कनेक्शन, चूल्हा एवं प्रथम रिफिल सिलेंडर ताकि महिलाओं को धुएं से मुक्ति व स्वस्थ जीवन मिल सके।",
      benefit:
        "Free LPG connection + gas stove + first full refill cylinder worth ₹1,600.",
      benefitHi:
        "मुफ्त एलपीजी गैस कनेक्शन + गैस चूल्हा + पहला भरा हुआ सिलेंडर।",
      eligibilityRules: {
        minAge: 18,
        maxAge: 75,
        maritalStatus: ["all"],
        requiresBPL: true,
        requiresSHG: false,
        allowedOccupations: ["all"],
        notes:
          "Applicant must be an adult woman belonging to a BPL household or SECC 2011 depository list with no existing LPG connection in the family.",
      },
      requiredDocuments: [
        {
          name: "BPL Ration Card / 14-Point Declaration",
          nameHi: "बीपीएल राशन कार्ड / 14-सूत्रीय घोषणा पत्र",
          required: true,
        },
        {
          name: "Aadhaar Card of Applicant & Family Members",
          nameHi: "आवेदिका एवं परिवार के सदस्यों का आधार कार्ड",
          required: true,
        },
        {
          name: "Bank Account Passbook (Aadhaar Linked)",
          nameHi: "बैंक पासबुक (आधार से लिंक)",
          required: true,
        },
      ],
      applicationSteps: [
        {
          step: 1,
          title: "Submit Form to Local LPG Distributor",
          description:
            "Fill Ujjwala Form-1 and submit to nearest Indane / BharatGas / HP Gas agency.",
        },
        {
          step: 2,
          title: "De-duplication Check",
          description:
            "OMC portal verifies no prior gas connection exists for the household.",
        },
        {
          step: 3,
          title: "Installation & Safety Briefing",
          description:
            "Agency installs cylinder and 2-burner stove at applicant home with demonstration.",
        },
      ],
      applicableDistricts: mpDistricts,
      officialSourceUrl: "https://www.pmuy.gov.in",
      nearestHelpCentre: {
        name: "District Supply Office (Food & Civil Supplies)",
        address: "Old Collectorate Building, Arera Hills, Bhopal",
        phone: "0755-2550123",
        email: "dso.bhopal@mp.gov.in",
      },
      lastCheckedAt: new Date("2026-10-18"),
      status: SchemeStatus.PUBLISHED,
    },
  });

  // Additional Scheme 4: Pradhan Mantri Awas Yojana - Gramin
  await prisma.scheme.create({
    data: {
      schemeCode: "SCH-104",
      name: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G Women Ownership Housing)",
      nameHi:
        "प्रधानमंत्री आवास योजना - ग्रामीण (महिला स्वामित्व पक्का आवास सहायता)",
      slug: "pm-awas-yojana-gramin-sch-104",
      category: "Social Security",
      need: "Housing",
      description:
        "Direct financial assistance of ₹1.20 Lakh in plain areas to construct a disaster-resilient pucca house with mandatory sole or joint ownership in the name of the female head of the family.",
      descriptionHi:
        "ग्रामीण बेघर व कच्चे मकान में रहने वाले परिवारों को महिला मुखिया के नाम पर पक्का मकान बनाने हेतु ₹1,20,000 की प्रत्यक्ष अनुदान सहायता एवं शौचालय निर्माण हेतु ₹12,000 अतिरिक्त।",
      benefit:
        "₹1,20,000 direct grant in 3 construction milestones + ₹12,000 for toilet under SBM.",
      benefitHi:
        "₹1,20,000 प्रत्यक्ष निर्माण अनुदान (3 किस्तों में) + ₹12,000 स्वच्छ भारत शौचालय सहायता।",
      eligibilityRules: {
        minAge: 18,
        maxAge: 70,
        maritalStatus: ["all"],
        requiresBPL: true,
        requiresSHG: false,
        allowedOccupations: ["all"],
        notes:
          "Houseless families or households living in zero, one, or two-room houses with kutcha wall and kutcha roof as per SECC 2011 / Awas+ survey.",
      },
      requiredDocuments: [
        {
          name: "Samagra Family ID & Job Card",
          nameHi: "समग्र आईडी एवं मनरेगा जॉब कार्ड",
          required: true,
        },
        { name: "Aadhaar Card", nameHi: "आधार कार्ड", required: true },
        {
          name: "Bank Passbook with DBT IFSC",
          nameHi: "बैंक पासबुक (डीबीटी सक्रिय)",
          required: true,
        },
        {
          name: "Land Title / Gram Sabha Recommendation",
          nameHi: "भू-अधिकार प्रमाण / ग्राम सभा अनुमोदन",
          required: true,
        },
      ],
      applicationSteps: [
        {
          step: 1,
          title: "Gram Sabha Verification",
          description:
            "Inclusion validated in the Annual Awas+ priority list by local Gram Sabha.",
        },
        {
          step: 2,
          title: "Geo-tagging of Site",
          description:
            "Panchayat mobile officer records geotagged photograph of existing kutcha house.",
        },
        {
          step: 3,
          title: "Milestone Disbursements",
          description:
            "Plinth, lintel, and roof completion verification triggers automated DBT instalments.",
        },
      ],
      applicableDistricts: mpDistricts,
      officialSourceUrl: "https://pmayg.nic.in",
      nearestHelpCentre: {
        name: "Janpad Panchayat Rural Development Cell",
        address: "Berasia Road / Phanda Janpad Panchayat, Bhopal",
        phone: "0755-2741288",
        email: "ceo.janpad.bhopal@mp.gov.in",
      },
      lastCheckedAt: new Date("2026-10-22"),
      status: SchemeStatus.PUBLISHED,
    },
  });

  // Additional Scheme 5: One Stop Centre (Sakhi) Scheme
  await prisma.scheme.create({
    data: {
      schemeCode: "SCH-125",
      name: "One Stop Centre (Sakhi) Integrated Women Emergency Relief",
      nameHi:
        "वन स्टॉप सेंटर (सखी योजना) - संकटग्रस्त महिलाओं हेतु एकीकृत आपातकालीन सहायता",
      slug: "one-stop-centre-sakhi-sch-125",
      category: "Legal & Protection",
      need: "Protection",
      description:
        "Centrally sponsored 24x7 support centre providing immediate medical aid, shelter, police assistance, psycho-social counseling, and legal aid to women facing domestic violence, distress, or abuse.",
      descriptionHi:
        "हिंसा, प्रताड़ना या संकट से पीड़ित महिलाओं को एक ही स्थान पर 24 घंटे आपातकालीन चिकित्सा, कानूनी सहायता, पुलिस संरक्षण, आश्रय एवं मनोवैज्ञानिक परामर्श सुविधा।",
      benefit:
        "Immediate 24x7 free medical aid, 5-day emergency shelter, legal counsel, and police support.",
      benefitHi:
        "तत्काल 24x7 निःशुल्क चिकित्सा उपचार, 5 दिवसीय आपातकालीन आश्रय, कानूनी सहायता एवं पुलिस संरक्षण।",
      eligibilityRules: {
        minAge: 0,
        maxAge: 99,
        maritalStatus: ["all"],
        requiresBPL: false,
        requiresSHG: false,
        allowedOccupations: ["all"],
        notes:
          "Any woman or girl facing violence, distress, domestic conflict, or requiring immediate emergency protection, irrespective of income, caste, or age.",
      },
      requiredDocuments: [
        {
          name: "Self-declaration / Hospital Emergency Slip (if available)",
          nameHi: "स्व-घोषणा / आपातकालीन पर्ची (उपलब्ध होने पर)",
          required: false,
        },
        {
          name: "Identity Proof (Optional at time of emergency admission)",
          nameHi: "पहचान पत्र (आपातकालीन प्रवेश के समय अनिवार्य नहीं)",
          required: false,
        },
      ],
      applicationSteps: [
        {
          step: 1,
          title: "Emergency Intake via Helpline 181 or Walk-in",
          description:
            "Call toll-free 181 or walk into the District Hospital Sakhi Centre.",
        },
        {
          step: 2,
          title: "Case Registration & Medical First Aid",
          description:
            "Immediate medical triage and assigned women case manager.",
        },
        {
          step: 3,
          title: "Counseling & Legal Protection",
          description:
            "Protection Officer coordinates with District Legal Services Authority (DLSA).",
        },
      ],
      applicableDistricts: mpDistricts,
      officialSourceUrl: "https://wcd.nic.in/schemes/one-stop-centre-scheme-1",
      nearestHelpCentre: {
        name: "Sakhi One Stop Centre, Sultania Zanana / JP Hospital Campus",
        address: "1250 Hospital Complex, Tulsi Nagar, Bhopal",
        phone: "181 / 0755-2559988",
        email: "sakhi.osc.bhopal@mp.gov.in",
      },
      lastCheckedAt: new Date("2026-11-01"),
      status: SchemeStatus.PUBLISHED,
    },
  });

  console.log(
    "🏛️ Seeded 8 Flagship Welfare Schemes covering pension, health, SHG loans, housing & safety.",
  );

  // Seed Help Requests for Beneficiary Workflows
  await prisma.helpRequest.create({
    data: {
      name: "Suman Bai Rajput",
      phone: "+91 98261 55443",
      district: "Sehore",
      schemeCode: "SCH-014",
      notes:
        "Needs guidance in procuring husband death certificate from Ashta Janpad Panchayat for widow pension application.",
      status: HelpRequestStatus.PENDING,
      createdAt: new Date("2026-11-05T08:30:00Z"),
    },
  });

  await prisma.helpRequest.create({
    data: {
      name: "Reena Verma",
      phone: "+91 94244 11223",
      district: "Raisen",
      schemeCode: "SCH-022",
      notes:
        "Maa Durga SHG group loan application submitted at Sanchi branch; requires field animator assistance for bank grading.",
      status: HelpRequestStatus.CONTACTED,
      createdAt: new Date("2026-11-03T11:20:00Z"),
    },
  });

  console.log("📞 Seeded 2 Help Requests for Field Coordinator Workflows.");

  // 6. Seed Sample Successful Donations & Concurrency-Safe 80G Receipts
  const trustName =
    "UdaanHer Women Welfare & Empowerment Charitable Trust (Bhopal)";
  const trustAddress = "Plot 14, Arera Hills, Bhopal, Madhya Pradesh - 462011";
  const trustPAN = "AAATC1234D";
  const trust80G = "CIT(E)/BPL/80G/2021-22/A-1089";

  // Seeded Donation 1
  const don1 = await prisma.donation.create({
    data: {
      donorId: donor1.id,
      campaignId: campaign1.id,
      amount: 5000,
      currency: "INR",
      donationType: DonationType.ONE_TIME,
      status: DonationStatus.SUCCESS,
      idempotencyKey: "IDEMP-SEED-001",
      paymentReference: "PAY_REF_TXN_001_A",
      paymentMethod: "UPI",
      donorName: "Priya Sharma",
      donorEmail: "priya.sharma@example.com",
      donorPhone: "+91 94250 88776",
      donorPAN: "ABCDE1234F",
      donorAddress:
        "Flat 402, Narmada Enclave, Arera Colony, Bhopal, MP 462016",
      createdAt: new Date("2026-10-10T10:30:00Z"),
    },
  });

  await prisma.payment.create({
    data: {
      donationId: don1.id,
      provider: "MOCK_PAYMENT_SIMULATOR",
      transactionReference: "TXN_SIM_20261010_0001",
      status: PaymentStatus.SUCCESS,
      responseMetadata: {
        method: "UPI",
        vpa: "priya@upi",
        simulated: true,
        gatewayStatus: "SUCCESS",
      },
      createdAt: don1.createdAt,
    },
  });

  await prisma.receipt.create({
    data: {
      donationId: don1.id,
      receiptNumber: "UDAAN/80G/2026-27/000001",
      donorName: "Priya Sharma",
      donorPAN: "ABCDE1234F",
      donationAmount: 5000,
      trustPAN,
      trust80GRegistrationNumber: trust80G,
      financialYear: currentFY,
      issuedAt: don1.createdAt,
    },
  });

  // Seeded Donation 2
  const don2 = await prisma.donation.create({
    data: {
      donorId: donor2.id,
      campaignId: campaign2.id,
      amount: 2500,
      currency: "INR",
      donationType: DonationType.MONTHLY,
      status: DonationStatus.SUCCESS,
      idempotencyKey: "IDEMP-SEED-002",
      paymentReference: "PAY_REF_TXN_002_B",
      paymentMethod: "CARD",
      donorName: "Rajesh Patel",
      donorEmail: "rajesh.patel@example.com",
      donorPhone: "+91 98930 44321",
      donorPAN: "BKZPP4589K",
      donorAddress: "12-B, Indrapuri Sector C, Raisen Road, Bhopal, MP 462022",
      createdAt: new Date("2026-10-14T14:15:00Z"),
    },
  });

  await prisma.payment.create({
    data: {
      donationId: don2.id,
      provider: "MOCK_PAYMENT_SIMULATOR",
      transactionReference: "TXN_SIM_20261014_0002",
      status: PaymentStatus.SUCCESS,
      responseMetadata: {
        method: "CARD",
        cardType: "DOMESTIC_DEBIT",
        simulated: true,
        gatewayStatus: "SUCCESS",
      },
      createdAt: don2.createdAt,
    },
  });

  await prisma.receipt.create({
    data: {
      donationId: don2.id,
      receiptNumber: "UDAAN/80G/2026-27/000002",
      donorName: "Rajesh Patel",
      donorPAN: "BKZPP4589K",
      donationAmount: 2500,
      trustPAN,
      trust80GRegistrationNumber: trust80G,
      financialYear: currentFY,
      issuedAt: don2.createdAt,
    },
  });

  // Seeded Donation 3
  const don3 = await prisma.donation.create({
    data: {
      donorId: donor1.id,
      campaignId: campaign3.id,
      amount: 1000,
      currency: "INR",
      donationType: DonationType.ONE_TIME,
      status: DonationStatus.SUCCESS,
      idempotencyKey: "IDEMP-SEED-003",
      paymentReference: "PAY_REF_TXN_003_C",
      paymentMethod: "NET_BANKING",
      donorName: "Priya Sharma",
      donorEmail: "priya.sharma@example.com",
      donorPhone: "+91 94250 88776",
      donorPAN: "ABCDE1234F",
      donorAddress:
        "Flat 402, Narmada Enclave, Arera Colony, Bhopal, MP 462016",
      createdAt: new Date("2026-10-22T09:45:00Z"),
    },
  });

  await prisma.payment.create({
    data: {
      donationId: don3.id,
      provider: "MOCK_PAYMENT_SIMULATOR",
      transactionReference: "TXN_SIM_20261022_0003",
      status: PaymentStatus.SUCCESS,
      responseMetadata: {
        method: "NET_BANKING",
        bank: "State Bank of India",
        simulated: true,
        gatewayStatus: "SUCCESS",
      },
      createdAt: don3.createdAt,
    },
  });

  await prisma.receipt.create({
    data: {
      donationId: don3.id,
      receiptNumber: "UDAAN/80G/2026-27/000003",
      donorName: "Priya Sharma",
      donorPAN: "ABCDE1234F",
      donationAmount: 1000,
      trustPAN,
      trust80GRegistrationNumber: trust80G,
      financialYear: currentFY,
      issuedAt: don3.createdAt,
    },
  });

  console.log("🧾 Seeded 3 donations with concurrency-safe receipts.");

  // 7. Seed an AI Draft Review (Pending review for SCH-014)
  await prisma.aIReview.create({
    data: {
      schemeId: scheme14.id,
      generatedHindiSummary:
        "यह योजना 18 से 79 वर्ष की बीपीएल कार्ड धारक विधवा महिलाओं के लिए है। इसके अंतर्गत ₹600 प्रति माह सीधे बैंक खाते में प्रदान किए जाते हैं। आवेदन हेतु पति का मृत्यु प्रमाण पत्र, बीपीएल राशन कार्ड और आधार-लिंक्ड बैंक खाता आवश्यक है। आवेदन ग्राम पंचायत या एमपी ऑनलाइन कियोस्क पर किया जा सकता है।",
      generatedEnglishSummary:
        "This scheme provides ₹600/month direct pension to widowed women aged 18-79 living below poverty line in Madhya Pradesh. Key documents include husband death certificate, BPL card, and Aadhaar bank passbook.",
      missingInformation: [],
      status: AIReviewStatus.PENDING,
    },
  });

  console.log("🤖 Seeded 1 AI Hindi Draft for Admin Review.");

  // 8. Log initial seed audit
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SYSTEM_SEED",
      entityType: "DATABASE",
      metadata: {
        environment: "development",
        seedVersion: "1.0.0",
        recordsCreated: {
          users: 3,
          schemes: 8,
          campaigns: 3,
          donations: 3,
          receipts: 3,
          helpRequests: 2,
        },
      },
    },
  });

  console.log(
    "✅ UdaanHer: Giving women wings to fly Database seeding completed successfully on MongoDB Atlas!",
  );
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
