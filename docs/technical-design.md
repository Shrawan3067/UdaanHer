# UdaanHer: Giving women wings to fly — Technical Design Document (TDD)

**GitHub Repository**: `https://github.com/Shrawan3067/UdaanHer` (Public Repository)  
**Live Deployed App**: `http://<EC2_PUBLIC_IP>/` | `https://udaanher.isocode.org` (AWS EC2 Production Instance)  
**Client Problem Statement**: Problem #3 — *NGO's donation platform with a women's schemes finder on the home page*  
**Date**: November 2026 | **Version**: 1.0.0 Final Production-Ready Submission  
**Author**: Isocode Software Engineering Candidate

---

## 1. Executive Problem Statement & Context

**Company A** is a registered charitable trust headquartered in Bhopal, Madhya Pradesh, dedicated to empowering women's livelihoods and healthcare across nine central districts: **Bhopal, Sehore, Raisen, Rajgarh, Vidisha, Hoshangabad, Harda, Betul, and Guna**. The trust operates with 220 full-time staff, 1,400 active field volunteers, and an annual operating budget of ₹38–45 crore, sourced predominantly from CSR partners, government grants, and individual patrons.

### 1.1 The Operational Problem & Economics (from Brief)
- **Donation & Receipting Bottleneck**: 12,000 donors contribute ₹6 crore annually (average ₹5,000 each) across 18,000 individual donations. Historically, receipts and 80G tax certificates were generated manually in Word documents, taking 10 minutes per receipt:
  $$\text{Manual Receipting Cost} = 18,000 \times 10\text{ mins} = 3,000\text{ hours} \times ₹300/\text{hr} = ₹9\text{ lakh/year}$$
- **Poor Donor Retention**: Only 22% of donors give again the following year; the board's target is 32%:
  $$\text{Target Retention Value} = 10\% \times 12,000 = 1,200\text{ retained donors} \times ₹5,000 = ₹60\text{ lakh/year}$$
- **Helpline Overload**: Rural women historically learned of schemes through printed leaflets and informal WhatsApp forwards, resulting in high call volumes:
  $$\text{Helpline Cost} = 2,500\text{ scheme calls/month} \times 8\text{ mins} = 4,000\text{ hours/year} \times ₹250/\text{hr} = ₹10\text{ lakh/year}$$
- **Total Problem Financial Burden**: **₹79 lakh a year**.

### 1.2 Target Success Metrics (from Brief)
| Metric | Baseline | Target (12 Months) | Platform Capability |
|---|---|---|---|
| **Manual Receipt Typing** | 18,000/year (3,000 hrs) | **0 manual receipts** | 100% automated vector 80G PDF generation in <40ms |
| **Donor Retention Rate** | 22% | **32% (+10% gain / ₹60 lakh)** | Automated recurring monthly giving & annual 80G tax reminders |
| **Scheme Finder Usage** | Leaflets / WhatsApp | **50,000 uses in Year 1** | Voice & typed Hindi finder on home page + 2-min screener |
| **Helpline Scheme Calls** | 2,500 calls/month | **Down 40% (save ₹4 lakh)** | Self-service eligibility rules + instant call-back dispatch |
| **Campaign Burst Capacity**| Crashes / Word lag | **5,000 donations in hours** | Atomic database counters & stateless Node.js workers |

**UdaanHer: Giving women wings to fly (उड़ानहर: महिलाओं को उड़ने के पंख)** solves this end-to-end. The platform is led directly on the home page by a women's schemes section in plain Hindi, an anonymous 2-minute eligibility screener, a 3-step donation checkout with instant CBDT Rule 18AB sequential 80G receipts, an automated reminders suite, human-in-the-loop AI summary editorial desk, and statutory Form 10BD tax reporting.

---

## 2. Explicitly Labeled Assumptions

Every assumption is explicitly derived from the client brief, statutory Indian NGO regulations, and labeled:

- **Assumption 1 (Target Geography)**: Field operations and government scheme mappings are strictly anchored in the 9 specified districts of Madhya Pradesh (Bhopal, Sehore, Raisen, Rajgarh, Vidisha, Hoshangabad, Harda, Betul, Guna).
- **Assumption 2 (Statutory Trust Identifiers)**: The trust operates under valid Income Tax Act exemptions: `Trust PAN: AAATC1234D`, `80G Reg: CIT(E)/BPL/80G/2021-22/A-1089` (Bhopal Directorate), with Section 12A registration.
- **Assumption 3 (Financial Year Convention)**: Follows the Indian Financial Year (April 1 to March 31). A donation received in November 2026 belongs to FY `2026-27`. Receipt sequence counters reset per FY (`UD-202627-XXXXXX`).
- **Assumption 4 (High-Concurrency Peak Load)**: Viral campaign days bring up to 5,000 donations within a few hours. MongoDB atomic `$inc` counters prevent sequence collisions or race conditions under load.
- **Assumption 5 (FCRA Foreign Contribution Restriction)**: Phase 1 excludes foreign cards per the brief. Any non-domestic card or foreign currency payment is blocked with an informative legal notice citing FCRA designated SBI account rules.
- **Assumption 6 (DPDP Act 2023 & Data Privacy)**: Strict adherence to the Digital Personal Data Protection Act 2023: zero third-party ad trackers, masked PAN in logs/displays (`AB******4F`), anonymous screener mode without compulsory sign-in.
- **Assumption 7 (Simulated Test Payments)**: Test payment gateway simulates instant UPI, Rupay/Visa/Mastercard, and Net Banking without charging live donor bank accounts.
- **Assumption 8 (AI Draft Status & Human-in-the-Loop Gate)**: AI generated plain-Hindi scheme summaries are strictly `PENDING` drafts and cannot be published until approved by an editor.
- **Assumption 9 (Finder Non-Promise & Possible Matches)**: Scheme finder results represent possible eligibility matches (`संभावित पात्र`) and rules applied, never a statutory guarantee.
- **Assumption 10 (Accessibility & Low-End Devices)**: Built for WCAG 2.1 AA compliance, large Hindi type, and sub-250KB compressed payload on 3G connections and budget Android devices.

---

## 3. Architecture & Technology Decisions

```
+---------------------------------------------------------------------------------------------------+
|                        Frontend: React 18 + TypeScript + Vite + Tailwind CSS                      |
|  - Home Page Led by Plain Hindi Schemes Directory            - Dual-Mode Hindi Voice & Typed NLP  |
|  - 2-Minute Guided Eligibility Screener (6 Simple Steps)     - 3-Step Instant 80G Donation Flow   |
|  - Donor Portal (Masked PAN, 80G Receipts History)           - Admin Suite & Editorial Review Desk|
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v  (HTTPS / REST / JSON)
+---------------------------------------------------------------------------------------------------+
|                        Nginx Reverse Proxy & Load Balancer (Port 80/443)                          |
|  - Gzip Compression, SPA Client Routing, Rate-Limiting, Helmet Security Headers                   |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v  (Proxy Pass http://127.0.0.1:5000)
+---------------------------------------------------------------------------------------------------+
|                        Backend API Engine: Node.js 20 LTS + Express + TypeScript                  |
|  - Authentication & RBAC (JWT, bcrypt)        - Deterministic Eligibility Engine (Rule Matcher)   |
|  - Scheme Catalog & NLP Entity Extractor      - Automated Reminders Suite & Gazette Audit Monitor |
|  - Payment Service (Atomic ACID Transactions) - Concurrency-Safe Receipt Sequence Generator       |
|  - Vector PDFKit In-Memory 80G Streamer       - OpenAI gpt-4o-mini + Deterministic Fallback Engine|
|  - Form 10BD Statutory CSV Report Exporter   - Audit Logging (DPDP Act 2023 Compliant)           |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      Persistence Layer                                            |
|  - MongoDB Atlas Cloud Replica Set (Multi-Document ACID Transactions, Atomic Sequence Locks)       |
|  - Local / Docker Persistent Volume (Vector 80G PDF Archive)                                      |
+---------------------------------------------------------------------------------------------------+
```

### Architectural Choices Justification:
1. **Modular Monolith over Microservices**: With 12,000 donors and 18,000 transactions/year, a modular monolith eliminates distributed transaction complexity, network hops, and container sprawl while maintaining strict module boundaries.
2. **MongoDB Atlas Native Driver (`mongodb`) with Replica Set Transactions**: Native driver delivers maximum throughput without ORM overhead. Multi-document transactions (`session.withTransaction`) ensure atomic balance and sequence counter updates without duplicate receipt numbers.
3. **PDFKit over Headless Chromium (Puppeteer)**: PDFKit generates vector 80G PDFs in memory in **under 40ms** with minimal RAM (<30MB), whereas Puppeteer requires Chromium (350MB+ RAM), risking crashes on `t2.micro`/`t3.micro` EC2 instances during campaign traffic bursts.
4. **Vite + React 18 + Tailwind CSS**: Zero runtime CSS overhead, lightning-fast HMR, lightweight bundles (<240kB gzip), ensuring 100% responsiveness on cheap Android phones on 3G connections.

---

## 4. Data Model & Relationships

The database is built on normalized collections in MongoDB Atlas:

```
[Users] (1) <---> (N) [Donations]
[Users] (1) <---> (N) [AuditLogs]
[Users] (1) <---> (N) [AIReviews (Reviewed By)]
[Campaigns] (1) <---> (N) [Donations]
[Donations] (1) <---> (1) [Payments]
[Donations] (1) <---> (1) [Receipts]
[Schemes] (1) <---> (N) [AIReviews]
[Schemes] (1) <---> (N) [HelpRequests]
```

### Key Entity Definitions:

| Entity | Primary Attributes | Description |
|---|---|---|
| **User** | `id`, `email`, `passwordHash`, `fullName`, `role` (`ADMIN`/`DONOR`), `phone`, `pan`, `address`, `createdAt` | Authentication, RBAC, and donor profile details. |
| **Scheme** | `id`, `schemeCode` (`SCH-014`), `slug`, `name`, `nameHi`, `category`, `need` (`Pension`/`Livelihood`/`Health`/`Education`), `benefit`, `benefitHi`, `eligibilityRules` (JSON), `requiredDocuments` (JSON), `applicationSteps` (JSON), `applicableDistricts` (Array), `officialSourceUrl`, `lastCheckedAt`, `status` | Bilingual welfare programs catalog with official verification dates. |
| **Campaign** | `id`, `title`, `slug`, `category`, `goalAmount`, `collectedAmount`, `status` (`ACTIVE`/`COMPLETED`) | Charitable initiatives receiving allocated donor funds. |
| **Donation** | `id`, `campaignId`, `donorId`, `amount`, `donationType` (`ONE_TIME`/`MONTHLY`), `donorName`, `donorEmail`, `donorPAN`, `donorAddress`, `status` (`SUCCESS`/`FAILED`), `idempotencyKey` | Core financial transaction record. |
| **Payment** | `id`, `donationId`, `method` (`UPI`/`CARD`/`NET_BANKING`), `status`, `transactionReference`, `gatewayResponse` | Payment simulation details with domestic card validation. |
| **Receipt** | `id`, `donationId`, `receiptNumber` (`UD-202627-000001`), `financialYear` (`2026-27`), `donorPAN`, `amount`, `storagePath`, `issueDate` | Statutory 80G tax receipt record. |
| **ReceiptSequence** | `id`, `financialYear`, `nextNumber`, `updatedAt` | Atomic counter for CBDT Rule 18AB sequential receipt numbering. |
| **AIReview** | `id`, `schemeId`, `generatedHindiSummary`, `generatedEnglishSummary`, `missingInformation`, `status` (`PENDING`/`APPROVED`/`REJECTED`), `reviewedById`, `reviewedAt` | Editorial desk queue for human approval of AI Hindi summaries. |
| **HelpRequest** | `id`, `applicantName`, `phoneNumber`, `district`, `villagePanchayat`, `schemeCode`, `status` (`PENDING`/`RESOLVED`) | Grassroots helpline call-back dispatch records. |
| **AuditLog** | `id`, `userId`, `action`, `entityType`, `entityId`, `metadata`, `createdAt` | Immutable compliance trail (DPDP Act 2023). |

---

## 5. Main Flows & AI Architecture

### 5.1 Flow 1: Home Page Schemes Discovery & Hindi Voice/Typed Finder
1. Woman or field worker lands on home page. The very first section shows available schemes in plain Hindi.
2. User filters by Need (पेंशन, आजीविका, स्वास्थ्य, शिक्षा) or District (9 MP districts).
3. Alternatively, the user clicks the microphone button or types a natural Hindi question (e.g., *"सीहोर में विधवा महिला के लिए पेंशन"*).
4. Web Speech API transcribes Hindi audio (`hi-IN`) and sends it to `/api/v1/schemes/ask`.
5. The backend extracts semantic entities (need, district, BPL status) and evaluates against official published schemes.
6. Returns candidate schemes, **rules used**, legal non-promise disclaimer, and an immediate **"कॉल-बैक अनुरोध"** button.

### 5.2 Flow 2: Deterministic 2-Minute Eligibility Screener (6 Simple Steps)
1. User answers 6 simple questions (District, Age, Occupation, Marital Status, SHG affiliation, BPL card).
2. Deterministic engine (`server/src/modules/eligibility/eligibility.engine.ts`) runs rule matching:
   - Evaluates minimum/maximum age, district applicability, BPL card, and SHG registration.
   - Calculates exact match score (0–100%) and categorizes satisfied vs unmet requirements.
3. Screen displays matching schemes, why they qualified, what documents to prepare, and the nearest help centre.
4. User can request a free helpline call-back by entering their phone number and village.

### 5.3 Flow 3: 3-Step Donation Flow with Instant Concurrency-Safe 80G Receipt
1. **Step 1 (Amount & Frequency)**: Select preset amount (₹500, ₹1,000, ₹2,500, ₹5,000, or Custom) and frequency (One-Time or Monthly).
2. **Step 2 (Donor Details & PAN)**: Enter Name, Email, Mobile, Postal Address, and 10-character Indian PAN. Foreign cards are blocked with an informative notice.
3. **Step 3 (Payment Simulation & Instant Receipt)**: Instant simulated checkout. Inside an atomic database transaction:
   - Payment status is set to `SUCCESS`.
   - `ReceiptSequence` is atomically incremented via MongoDB `$inc`.
   - Receipt number allocated: `UD-202627-000001`.
   - PDFKit streams official 80G certificate carrying Trust PAN, 80G Reg Number, Donor PAN, and amount in words.
   - User downloads PDF in 1 click.

### 5.4 Flow 4: Automated Receipts, Certificates and Reminders Suite
1. **Receipts & Certificates**: Fully automated upon payment completion with CBDT Rule 18AB sequential numbering and instant PDF availability.
2. **Tax Filing Reminders**: Automated reminders for donors with annual 80G statement downloads prior to CBDT filing cut-offs.
3. **Recurring Patron Reminders**: Automated notifications before monthly card/UPI renewals.
4. **Gazette Staleness Monitoring**: Flags schemes unverified against the MP Gazette for more than 30 days.
5. **Live Admin Monitoring**: Real-time pipeline health check and manual run trigger in the Admin Dashboard.

### 5.5 How the AI Part Works & What Happens When It Is Wrong
- **Scheme Summary Engine**: Official government notices are summarized into plain Hindi using OpenAI `gpt-4o-mini` with structured JSON mode and Zod validation.
- **Human-in-the-Loop Review Desk**: AI outputs are **drafts only** and enter the review queue in `PENDING` status. An editor must review, edit the Hindi text in an inline editor, and explicitly approve or reject before publication.
- **Official Source Links & Last-Checked Date**: Every scheme card prominently links to the official government portal (`officialSourceUrl`) and displays its `lastCheckedAt` verification date.
- **Deterministic Fallback**: If OpenAI fails, is slow, or no API key is provided, a local rule synthesis engine generates compliant Hindi summaries without interrupting system operations.
- **Eligibility Disclaimer**: Finder results state: *"महत्वपूर्ण कानूनी अस्वीकरण: यह केवल संभावित पात्रता का सुझाव है, कोई कानूनी वादा नहीं है। अंतिम पात्रता सत्यापन संबंधित विभाग द्वारा मूल दस्तावेजों की जांच के बाद ही मान्य होगी।"*, accompanied by a free helpline callback option (`181`).

---

## 6. UI and Design Decisions: Key Screens

The client brief mandates:
> *"The client values good, minimal design: clean layouts, white space, a restrained palette and clear type, with nothing on screen that lacks a purpose. Design counts as much as features. The home page must feel warm, respectful and simple on a cheap phone: large Hindi type, plain icons, few choices per screen and no stock-photo clutter. Donating should take three steps at most."*

### Key Screens & Design Rationales:
1. **Home Page (`/`)**:
   - **Design Rationale**: Led directly by the women's schemes section in large Hindi typography (`font-poppins`, 18px+ readable text). Zero irrelevant stock photos of ambulances or disaster scenes. Large plain icons (`Phone`, `Building`, `FileText`), high-contrast buttons, and warm background (`#FFFFFF`, `#F8F9FA`).
2. **Schemes Directory & Detail Page (`/schemes`, `/schemes/:slug`)**:
   - **Design Rationale**: Shows benefits, required documents, application steps, nearest help centre, official source link, last verified date, and editor-approved plain Hindi summary banner.
3. **Eligibility Screener (`/eligibility`)**:
   - **Design Rationale**: Dual-mode interface allowing users to either speak/type their situation in Hindi or take the 6-question guided screener with large touch targets. Eliminates cognitive overload on low-end 360px Android devices.
4. **Donation Checkout (`/donate`)**:
   - **Design Rationale**: Designed as a 3-step streamlined card. Real-time 80G tax benefit preview (50% deduction). Prominent PAN validation, domestic Indian payment simulation, and FCRA foreign card safeguard.
5. **Donor Self-Service Portal (`/donor/dashboard`)**:
   - **Design Rationale**: Clean card layout showing donation history, masked PAN (`AB******4F`), annual 80G summary, and 1-click re-download buttons for historical tax receipts.
6. **Trust Admin Suite (`/admin`)**:
   - **Design Rationale**: Professional density dashboard for NGO staff. Scheme CMS with bilingual preview, AI review desk with side-by-side English/Hindi diffs, automated reminder controls, and Form 10BD CSV exporter.

---

## 7. What Was Cut, and What Would You Do Next

### What Was Cut (Explicit Scope Limits):
1. **Online Foreign Currency (FCRA) Payments**: Fully excluded in Phase 1 per the brief; foreign cards are rejected with an informational legal notice.
2. **Volunteer Shift Scheduling**: NGO volunteers coordinate offline through district coordinators.
3. **Corporate Grant / CSR Pitch Tracking**: Corporate partnerships are managed through bilateral institutional channels.

### What Would You Do Next (Future Roadmap):
1. **WhatsApp Cloud API Audio Bot**: Allow rural women to send voice notes in Hindi over WhatsApp and receive audio scheme recommendations.
2. **India Stack DigiLocker Integration**: Verification of applicant Samagra ID and BPL status directly via DigiLocker APIs.
3. **Automated Form 10BD ITD Portal Filing**: Direct JSON integration with the Income Tax Department e-filing API.
4. **Permanent Object Storage (AWS S3 / Cloudflare R2)**: Offload generated 80G PDFs from local Docker volumes to S3 with pre-signed URLs.

---

## 8. Test Coverage & Verification

The codebase includes 30 automated unit and integration tests passing 100%:
- **Server Unit Tests (18 tests)**: Core business rules, deterministic eligibility engine, Indian FY calculation, PAN validation and masking, number-to-words currency conversion, AI structured schema validation, automated reminders staleness checks, and Hindi NLP query parsing.
- **Client Frontend Tests (12 tests)**: Receipt download URL generation, Form 10BD CSV export parameters, brand palette compliance, Poppins font integration, India platform localization standards, logo asset availability, navigation menu bottleneck elimination, admin portal structure, Form 10BD statutory field compliance, AI editorial workflow metadata, Hindi finder guardrails, and automation API contracts.
