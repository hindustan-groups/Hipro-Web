# Vendor Portal (Empanelment) — System Architecture & Operational Status

## 1. Executive Summary & Purpose

The **Vendor Portal (Empanelment Ecosystem)** is the official contractor, subcontractor, material supplier, and equipment vendor management platform of Hindustan Projects.

It governs the entire vendor lifecycle:
1. **Onboarding & Verification:** Digital registration, GST verification, financial compliance, and technical capability auditing.
2. **CPWD Capacity Classification:** Vendor grading into formal capacity classes (Class A, B, C, D) dictating project financial ceilings and bidding eligibility.
3. **Tender Publishing & Bidding:** Selective or open procurement tenders, document issuance, and secure bid submission.
4. **Site Access Control (Digital Gate Passes):** Dynamic generation and QR-code verification of physical jobsite access passes for personnel, heavy equipment, and material trucks.
5. **Vendor Invoicing & Work Orders:** Tracking contractor milestones, work orders, payment certificates, and support tickets.

The portal operates on dedicated subdomains (`empanelment.hindustanprojects.in` and `vendor.hindustanprojects.in`), rewritten internally to `frontend/app/empanelment/`, backed by `backend/src/routes/empanelment.ts` and managed via `/admin/empanelment`.

---

## 2. Domain & Routing Topology

### Subdomain Rewriting
Next.js Edge Middleware (`frontend/middleware.ts`) transparently routes vendor traffic:
- **Production Hostnames:** `empanelment.hindustanprojects.in`, `vendor.hindustanprojects.in`.
- **Local Hostname:** `empanelment.localhost:3000`.
- **Internal Target:** `app/empanelment/*`.
- **Direct Path Access:** Visiting `https://hindustanprojects.in/empanelment` also maps directly to the portal.
- **Host Isolation:** Requests to `/admin` or `/admin-login` arriving on empanelment domains are intercepted and 301-redirected to the canonical corporate origin `https://www.hindustanprojects.in/admin`.

---

## 3. CPWD Capacity Tiering & Financial Ceilings

Vendors are categorized according to Central Public Works Department (CPWD) standard capacity classifications, ensuring alignment with public infrastructure guidelines:

| Tier | Capacity Class | Project Financial Ceiling | Minimum Experience & Audit Requirements |
| :--- | :--- | :--- | :--- |
| **Class A** | Prime EPC & Heavy Civil | Unlimited (> ₹50 Crore) | Minimum 10 years experience; audited 3-year turnover > ₹25 Cr; ISO & safety certifications required. |
| **Class B** | Major Subcontractor | Up to ₹50 Crore | Minimum 5 years experience; audited 3-year turnover > ₹10 Cr; documented completed projects. |
| **Class C** | Specialized Trade Contractor | Up to ₹10 Crore | Minimum 3 years experience; electrical/plumbing/structural licenses; verified GST compliance. |
| **Class D** | Material & Equipment Supplier | Up to ₹2 Crore | Active GST registration; authorized dealership or manufacturer certificate; bank verification. |

Tiering is assigned during application review by the procurement board in Master Admin (`/admin/empanelment`).

---

## 4. Frontend Route Inventory (`frontend/app/empanelment`)

The vendor portal frontend is structured under `frontend/app/empanelment`:

| Route Path | File Path | Purpose & Functionality |
| :--- | :--- | :--- |
| `/` (via rewrite) / `/empanelment` | `app/empanelment/page.tsx` | Portal landing page: empanelment benefits, active tenders ticker, CPWD tiers, quick links. |
| `/apply` | `app/empanelment/apply/page.tsx` | Multi-step vendor registration form (Company Profile, GST/PAN, Banking, Experience). |
| `/track` | `app/empanelment/track/page.tsx` | Public application status lookup using Tracking ID or registered mobile phone number. |
| `/tenders` | `app/empanelment/tenders/page.tsx` | Active procurement tenders, BOQ requirements, submission deadlines, and bid intake. |
| `/gate-pass` | `app/empanelment/gate-pass/page.tsx` | Site pass requisition form for labor crews, project engineers, and delivery vehicles. |
| `/verify-pass` | `app/empanelment/verify-pass/page.tsx` | On-site security checkpoint scanner verifying pass codes and QR tokens in real time. |
| `/guidelines` | `app/empanelment/guidelines/page.tsx` | Comprehensive empanelment rules, required documentation checklist, and Code of Conduct. |

---

## 5. Security & Privacy Hardening (SEC-CRIT-02 & DATA-CRIT-01)

### PII Redaction on Public Tracking (`SEC-CRIT-02`)
The application tracking endpoint (`GET /api/empanelment/track/:trackingId`) is publicly accessible to allow prospective vendors to check registration progress without complex authentication.

To eliminate data leakage and enumeration vulnerabilities, the backend implements strict Prisma projection filtering:
- **Exposed Public Fields (Safe):** `id`, `trackingId`, `status`, `currentStage`, `tier`, `category`, `companyName`, `applicantName`, `createdAt`, `updatedAt`.
- **Strictly Omitted Sensitive Fields:**
  - `pan`: Permanent Account Number (Indian government tax identifier).
  - `gstin`: Goods and Services Tax Identification Number.
  - `bankAccountNumber`, `bankIfsc`, `bankName`: Banking credentials.
  - `passportPhotoUrl`: Biometric personal identification media.
  - `adminRemarks`: Internal board evaluation notes, risk scores, and procurement comments.
  - `ceoSigned`, `ceoSignedDate`: Internal signing signatures and corporate authorization timestamps.

### Input Sanitization & Field Harmonization (`DATA-CRIT-01`)
- Registration forms normalize company names, trim white spaces, and enforce regex validation on GSTIN (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`) and PAN (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`).
- Duplicate applications with identical GSTIN or PAN are rejected at the database level via unique constraints.

---

## 6. Site Gate Pass Subsystem

Physical security and safety on high-risk construction jobsites require strict access control:
1. **Pass Requisition (`POST /api/empanelment/gate-pass/generate`):**
   Empaneled contractors submit personnel or vehicle details (visitor name, Aadhaar/ID number, project site ID, pass type, validity window).
2. **Pass Generation:**
   A unique, cryptographically random pass code (`passCode`) is generated alongside an encrypted QR payload containing verification metadata.
3. **Field Verification (`GET /api/empanelment/gate-pass/verify/:passCode`):**
   Site security officers scan the QR code using `/empanelment/verify-pass`. The endpoint returns verification status (`ACTIVE`, `EXPIRED`, `REVOKED`), passenger count, allowed jobsite zone, and supervisor emergency contact.

---

## 7. Database Models (`backend/prisma/schema.prisma`)

The vendor ecosystem utilizes 8 dedicated Prisma models:
1. **`VendorApplication`**: Vendor master record (`trackingId`, `companyName`, `applicantName`, `email`, `phone`, `gstin`, `pan`, `tier`, `category`, `status`, `currentStage`, `address`, `documents`).
2. **`EmpanelmentTender`**: Procurement listings (`tenderNumber`, `title`, `description`, `category`, `estimatedCost`, `emdAmount`, `closingDate`, `status`, `documents`).
3. **`VendorBid`**: Contractor commercial proposals (`tenderId`, `vendorId`, `bidAmount`, `technicalDocUrl`, `commercialDocUrl`, `status`, `submittedAt`).
4. **`SiteGatePass`**: Jobsite access permits (`passCode`, `vendorId`, `projectId`, `visitorName`, `visitorType`, `vehicleNumber`, `validFrom`, `validUntil`, `status`).
5. **`VendorWorkOrder`**: Executed contracts and project awards (`workOrderNumber`, `vendorId`, `projectId`, `contractValue`, `startDate`, `targetDate`, `status`).
6. **`VendorInvoice`**: Contractor billing and milestone invoices (`invoiceNumber`, `workOrderId`, `vendorId`, `amount`, `gstAmount`, `totalAmount`, `status`).
7. **`EmpanelmentTicket`**: Vendor helpdesk and technical disputes (`ticketNumber`, `vendorId`, `subject`, `description`, `priority`, `status`).
8. **`EmpanelmentContent`**: CMS settings, onboarding guidelines, and category definitions.

---

## 8. Current Implementation Status vs. Pending Work

### Completed Work
- [x] Full responsive vendor portal interface (`apply`, `track`, `tenders`, `gate-pass`, `verify-pass`, `guidelines`).
- [x] Edge middleware routing for `empanelment.*` and `vendor.*` with host isolation.
- [x] PII redaction on public tracking endpoint (`SEC-CRIT-02`).
- [x] Field harmonization and regex validation for tax identifiers (`DATA-CRIT-01`).
- [x] 29 REST API endpoints covering applications, tenders, bidding, gate passes, work orders, and invoices.
- [x] Master Admin vendor management studio (`/admin/empanelment`).

### Known Pending Work
- [ ] **OTP / SMS Verification on Application Submission:** Currently, email alerts are dispatched; integrating SMS-based OTP verification (e.g., via Twilio or Fast2SMS) for phone number validation is recommended for Phase 3.
- [ ] **Live GSTIN Verification Integration:** The `/api/empanelment/gst-verify` endpoint currently provides structural format and checksum validation; integrating a live Government of India GST API provider is planned for commercial production.
- [ ] **Automated Bid Evaluation Matrix:** Scoring technical vs. financial criteria currently relies on manual board scoring in Master Admin.

