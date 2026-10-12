# 🗄️ HINDUSTAN PROJECTS — EMPANELMENT PRISMA DATABASE SCHEMA SPECIFICATION

This schema defines the PostgreSQL models to be added to `backend/prisma/schema.prisma`. It replaces the disparate SQLite tables (`vendors`, `tenders`, `bids`, `gate_passes`, `invoices`, `tickets`) with high-performance, strictly typed relational models.

---

```prisma
// ===================================================================
// HINDUSTAN PROJECTS — VENDOR & CONTRACTOR EMPANELMENT PORTAL MODELS
// ===================================================================

enum EmpanelmentStatus {
  DRAFT
  SUBMITTED
  UNDER_VERIFICATION
  TECHNICAL_AUDIT
  FINANCIAL_REVIEW
  APPROVED
  REJECTED
  BLACKLISTED
}

enum VendorTier {
  CLASS_A      // Large Scale / Infrastructure (Turnover ₹5Cr+)
  CLASS_B      // Medium Scale / Commercial (Turnover ₹1Cr - ₹5Cr)
  CLASS_C      // Small Scale / Specialized Sub-Contractor (< ₹1Cr)
  PROVISIONAL  // Under provisional probation
}

enum EntityType {
  PROPRIETORSHIP
  PARTNERSHIP
  PRIVATE_LIMITED
  PUBLIC_LIMITED
  LLP
  INDIVIDUAL
}

model VendorApplication {
  id                    String            @id @default(cuid())
  trackingId            String            @unique // e.g. "HP-EMP-849201"
  hashSignature         String?           // SHA-256 audit signature
  status                EmpanelmentStatus @default(SUBMITTED)
  currentStage          String            @default("Initial Screening")
  tier                  VendorTier        @default(PROVISIONAL)
  
  // Category & Core Competence
  category              String            // Civil, MEP, Suppliers, Architects, Equipment, Logistics
  primaryRole           String?
  specialization        String?
  skillsDetails         String?           @db.Text
  teamSize              String?
  
  // Enterprise & Legal Entity Details
  companyName           String
  entityType            EntityType        @default(PROPRIETORSHIP)
  establishmentYear     String?
  ownerName             String?
  ownerContact          String?
  contactName           String
  designation           String?
  email                 String
  phone                 String
  
  // Registered Office & Local Grounding
  address               String            @db.Text
  city                  String
  district              String?
  state                 String
  pincode               String
  
  // Statutory Compliance & Tax Numbers
  gstin                 String?
  isGstVerified         Boolean           @default(false)
  pan                   String
  aadharNo              String?
  msmeUdyamNo           String?
  
  // Financial Credentials & Banking
  bankName              String?
  accountNumber         String?
  ifscCode              String?
  turnoverYear1         String?           // FY 2023-24
  turnoverYear2         String?           // FY 2024-25
  turnoverYear3         String?           // FY 2025-26
  largestOrderValue     String?
  existingEmpanelments  String?           @db.Text
  
  // Paperless Document Vault (Cloudinary / Storage Secure URLs)
  gstCertificateUrl     String?
  panCardUrl            String?
  bankChequeUrl         String?
  workExperienceDocUrl  String?
  passportPhotoUrl      String?
  signatureUrl          String?           @db.Text
  signatoryName         String?
  
  // Internal Verification & Corporate Grading
  eligibilityScore      Int               @default(0) // 0 - 100 points
  adminRemarks          String?           @db.Text
  assignedOfficerId     String?           // Delegated Staff member ID
  assignedOfficerName   String?
  ceoSigned             Boolean           @default(false)
  ceoSignedDate         DateTime?
  digitalCertificateUrl String?
  
  // Security & Audit
  ipAddress             String?
  submittedAt           DateTime          @default(now())
  approvedAt            DateTime?
  updatedAt             DateTime          @updatedAt

  // Relations
  bids                  VendorBid[]
  gatePasses            SiteGatePass[]
  workOrders            VendorWorkOrder[]
  invoices              VendorInvoice[]
  tickets               EmpanelmentTicket[]

  @@index([status])
  @@index([category])
  @@index([tier])
  @@index([email])
  @@index([phone])
  @@index([city])
}

model EmpanelmentTender {
  id                    String      @id @default(cuid())
  tenderNo              String      @unique // e.g. "HP-TND-2026-08"
  title                 String
  category              String      // Civil, MEP, Suppliers, etc.
  location              String
  estimatedBudget       String
  emdAmount             String?
  publishDate           DateTime    @default(now())
  dueDate               DateTime
  status                String      @default("ACTIVE") // ACTIVE, EVALUATION, AWARDED, ARCHIVED
  scopeOfWork           String      @db.Text
  documentUrl           String?
  bidsCount             Int         @default(0)
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  bids                  VendorBid[]

  @@index([status])
  @@index([category])
}

model VendorBid {
  id                    String             @id @default(cuid())
  tenderId              String
  vendorId              String
  bidAmount             Float
  proposedDays          Int?
  remarks               String?            @db.Text
  status                String             @default("UNDER_REVIEW") // UNDER_REVIEW, SHORTLISTED, ACCEPTED, REJECTED
  submittedAt           DateTime           @default(now())

  tender                EmpanelmentTender  @relation(fields: [tenderId], references: [id], onDelete: Cascade)
  vendor                VendorApplication  @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([tenderId])
  @@index([vendorId])
  @@index([status])
}

model SiteGatePass {
  id                    String             @id @default(cuid())
  passCode              String             @unique // e.g. "HP-GP-98214"
  vendorId              String
  visitorName           String
  workerCount           Int                @default(1)
  vehicleNo             String?
  siteLocation          String
  validFrom             DateTime           @default(now())
  validTill             DateTime
  status                String             @default("ACTIVE") // ACTIVE, EXPIRED, REVOKED
  securityRemarks       String?
  createdAt             DateTime           @default(now())

  vendor                VendorApplication  @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId])
  @@index([passCode])
  @@index([status])
}

model VendorWorkOrder {
  id                    String             @id @default(cuid())
  workOrderNo           String             @unique // e.g. "HP-WO-2026-44"
  vendorId              String
  projectName           String
  packageTitle          String
  contractAmount        Float
  startDate             DateTime?
  completionTargetDate  DateTime?
  progressPercent       Int                @default(0)
  status                String             @default("IN_EXECUTION") // IN_EXECUTION, COMPLETED, ON_HOLD
  contractDocUrl        String?
  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  vendor                VendorApplication  @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  invoices              VendorInvoice[]

  @@index([vendorId])
}

model VendorInvoice {
  id                    String             @id @default(cuid())
  invoiceNo             String             @unique // e.g. "INV-2026-091"
  workOrderId           String?
  vendorId              String
  amount                Float
  tdsDeduction          Float              @default(0)
  netPayable            Float
  status                String             @default("UNDER_REVIEW") // UNDER_REVIEW, APPROVED, PAID, DISPUTED
  rtgsRef               String?
  paidAt                DateTime?
  createdAt             DateTime           @default(now())

  vendor                VendorApplication  @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  workOrder             VendorWorkOrder?   @relation(fields: [workOrderId], references: [id], onDelete: SetNull)

  @@index([vendorId])
  @@index([status])
}

model EmpanelmentTicket {
  id                    String             @id @default(cuid())
  ticketNo              String             @unique // e.g. "HP-TCK-712"
  vendorId              String
  subject               String
  category              String
  priority              String             @default("NORMAL") // LOW, NORMAL, HIGH, URGENT
  message               String             @db.Text
  status                String             @default("OPEN") // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  adminReply            String?            @db.Text
  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  vendor                VendorApplication  @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@index([vendorId])
  @@index([status])
}
```
