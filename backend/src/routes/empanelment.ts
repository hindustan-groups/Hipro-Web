import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { requirePermission } from "../middleware/authGuard";
import crypto from "crypto";
import {
  sendApplicationReceivedEmail,
  sendApplicationStatusEmail,
  sendSiteGatePassEmail,
  sendVendorActivationEmail,
  sendPasswordResetEmail,
  sendCustomVendorEmail,
  getEmpanelmentEmailLogs,
  retryEmpanelmentEmail,
} from "../services/empanelmentMailer";
import {
  createOrGetVendorAccount,
  generateActivationToken,
  requestPasswordReset,
} from "../services/vendorAccountService";
import {
  logVendorActivity,
  getVendorActivityLogs,
} from "../services/vendorActivityService";
import {
  getPublicCategories,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  createAdminSubcategory,
  updateAdminSubcategory,
  resolveTradeCategory,
  resolveSubcategories,
} from "../services/vendorCategoryService";

const router = Router();

// Indian State Codes mapping for GSTIN auto-decoder
const GST_STATE_MAP: Record<string, string> = {
  "01": "Jammu & Kashmir",
  "02": "Himachal Pradesh",
  "03": "Punjab",
  "04": "Chandigarh",
  "05": "Uttarakhand",
  "06": "Haryana",
  "07": "Delhi",
  "08": "Rajasthan",
  "09": "Uttar Pradesh",
  "10": "Bihar",
  "11": "Sikkim",
  "12": "Arunachal Pradesh",
  "13": "Nagaland",
  "14": "Manipur",
  "15": "Mizoram",
  "16": "Tripura",
  "17": "Meghalaya",
  "18": "Assam",
  "19": "West Bengal",
  "20": "Jharkhand",
  "21": "Odisha",
  "22": "Chhattisgarh",
  "23": "Madhya Pradesh",
  "24": "Gujarat",
  "26": "Dadra & Nagar Haveli and Daman & Diu",
  "27": "Maharashtra",
  "29": "Karnataka",
  "30": "Goa",
  "32": "Kerala",
  "33": "Tamil Nadu",
  "34": "Puducherry",
  "36": "Telangana",
  "37": "Andhra Pradesh",
  "38": "Ladakh",
};

const ENTITY_TYPE_MAP: Record<string, string> = {
  C: "Company (Private or Public Ltd)",
  P: "Proprietorship (Individual)",
  F: "Partnership / LLP Firm",
  H: "Hindu Undivided Family (HUF)",
  A: "Association of Persons (AOP)",
  T: "Trust",
  B: "Body of Individuals (BOI)",
  L: "Local Authority",
  J: "Artificial Juridical Person",
  G: "Government Agency",
};

// ===================================================================
// PHASE 2B: CANONICAL CATEGORIES & CAPACITY BRACKETS
// ===================================================================

export const APPROVED_VENDOR_CATEGORIES = [
  "Civil Construction",
  "Electrical & MEP",
  "Plumbing & Sanitation",
  "Fabrication & PEB",
  "Flooring & Finishing",
  "Material Supply",
] as const;

export const ALLOWED_TEAM_SIZE_BRACKETS = ["1-10", "11-50", "51-200", "200+"] as const;

export const ALLOWED_TURNOVER_BRACKETS = [
  "Under ₹10 Lakh",
  "₹10 Lakh – ₹50 Lakh",
  "₹50 Lakh – ₹2 Crore",
  "Above ₹2 Crore",
] as const;

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function resolveTeamSizeBracket(rawTeamSize: any, _legacyWorkforceCount?: any): string | null {
  if (typeof rawTeamSize === "string") {
    const trimmed = rawTeamSize.trim();
    if (ALLOWED_TEAM_SIZE_BRACKETS.includes(trimmed as any)) {
      return trimmed;
    }
  }
  return null;
}

export function resolveTurnoverBracket(rawBracket: any, _legacyAnnualTurnover?: any): string | null {
  if (typeof rawBracket !== "string") return null;
  const trimmed = rawBracket.trim();
  if (!trimmed) return null;
  const normalized = trimmed.replace(/\s*[\u2013\u2014-]\s*/g, " – ").replace(/\s+/g, " ");
  const match = ALLOWED_TURNOVER_BRACKETS.find(
    (b) => b === trimmed || b === normalized || b.toLowerCase() === normalized.toLowerCase()
  );
  return match || null;
}

// ===================================================================
// PUBLIC VENDOR ENDPOINTS
// ===================================================================

/**
 * 1. GSTIN Auto-Decoder & PAN extraction
 * POST /api/empanelment/gst-verify
 */
router.post("/gst-verify", (req: Request, res: Response) => {
  try {
    const raw = (req.body?.gstin || "").trim().toUpperCase();

    if (!raw || raw.length !== 15 || !GSTIN_REGEX.test(raw)) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: "Invalid 15-digit GSTIN format. Example: 08AAAAA0000A1Z5",
      });
    }

    const stateCode = raw.substring(0, 2);
    const pan = raw.substring(2, 12);
    const entityChar = pan.charAt(3);
    const state = GST_STATE_MAP[stateCode] || "Other / Union Territory";
    const entityType = ENTITY_TYPE_MAP[entityChar] || "Commercial Enterprise";

    return res.json({
      success: true,
      valid: true,
      gstin: raw,
      pan,
      stateCode,
      state,
      entityType,
      isRajasthan: stateCode === "08",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 2. Submit New Vendor Empanelment Application (5-Step Wizard)
 * POST /api/empanelment/apply
 */
router.post("/apply", async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // Validate mandatory registration fields
    const companyName = typeof data.companyName === "string" ? data.companyName.trim() : "";
    const contactName = typeof data.contactName === "string" ? data.contactName.trim() : "";
    const phone = typeof data.phone === "string" ? data.phone.trim() : "";
    const email = typeof data.email === "string" ? data.email.trim() : "";
    const pan = typeof data.pan === "string" ? data.pan.trim().toUpperCase() : "";

    if (!companyName || !contactName || !phone || !email || !pan) {
      return res.status(400).json({
        success: false,
        error: "Mandatory fields missing (Company Name, Contact Person, Phone, Email, PAN)",
      });
    }

    // Structural PAN format validation (Standard 10-char Indian PAN: 5 uppercase letters, 4 digits, 1 uppercase letter)
    if (!PAN_REGEX.test(pan)) {
      return res.status(400).json({
        success: false,
        error: "Invalid PAN number format. Permanent Account Number must be 10 characters (e.g. ABCDE1234F).",
      });
    }

    // Require explicit terms and code of conduct agreement
    if (data.termsAgreed !== true) {
      return res.status(400).json({
        success: false,
        error: "You must agree to the code of conduct declaration before submitting.",
      });
    }

    // Resolve work experience / past work document with canonical precedence over legacy alias.
    // Ensure an empty legacy alias cannot overwrite a valid canonical value.
    let resolvedWorkExperienceDocUrl: string | null = null;
    if (typeof data.workExperienceDocUrl === "string" && data.workExperienceDocUrl.trim().length > 0) {
      resolvedWorkExperienceDocUrl = data.workExperienceDocUrl.trim();
    } else if (typeof data.pastWorkDocUrl === "string" && data.pastWorkDocUrl.trim().length > 0) {
      resolvedWorkExperienceDocUrl = data.pastWorkDocUrl.trim();
    }

    // Resolve MSME / Udyam document URL
    let resolvedMsmeDocUrl: string | null = null;
    if (typeof data.msmeDocUrl === "string" && data.msmeDocUrl.trim().length > 0) {
      resolvedMsmeDocUrl = data.msmeDocUrl.trim();
    }

    // Resolve Establishment Year (Store actual calendar year, NEVER calculate from yearsInBusiness)
    let resolvedEstablishmentYear: string | null = null;
    if (typeof data.establishmentYear === "string" && data.establishmentYear.trim().length > 0) {
      resolvedEstablishmentYear = data.establishmentYear.trim();
    } else if (typeof data.establishmentYear === "number" && !isNaN(data.establishmentYear)) {
      resolvedEstablishmentYear = String(data.establishmentYear);
    }

    // Resolve Turnover Bracket (Dedicated field, never write into audited multi-year turnover fields)
    const rawTurnoverCandidate =
      (typeof data.turnoverBracket === "string" && data.turnoverBracket.trim().length > 0 ? data.turnoverBracket.trim() : null) ||
      (typeof data.annualTurnover === "string" && data.annualTurnover.trim().length > 0 ? data.annualTurnover.trim() : null);

    const resolvedTurnoverBracket = resolveTurnoverBracket(data.turnoverBracket, data.annualTurnover);

    if (rawTurnoverCandidate && !resolvedTurnoverBracket) {
      return res.status(400).json({
        success: false,
        error: `Invalid annual turnover bracket '${rawTurnoverCandidate}'. Allowed brackets: ${ALLOWED_TURNOVER_BRACKETS.join(", ")}`,
      });
    }

    // Resolve Workforce Capacity (teamSize bracket)
    const resolvedTeamSize = resolveTeamSizeBracket(data.teamSize, data.workforceCount);

    // Resolve Category & Unclassified State with Dual-Write
    let resolvedCategory: string | null = null;
    let resolvedCategoryId: string | null = null;
    let currentStage = "Pending Trade Classification";

    try {
      const categoryRes = await resolveTradeCategory(prisma, {
        categoryId: data.categoryId,
        category: data.category,
      });
      resolvedCategory = categoryRes.category;
      resolvedCategoryId = categoryRes.categoryId;
      if (resolvedCategory) {
        currentStage = "Document Audit & Compliance Verification";
      }
    } catch (catErr: any) {
      return res.status(catErr.status || 400).json({
        success: false,
        error: catErr.message || "Invalid trade category",
      });
    }

    // Resolve Subcategories (if provided)
    let resolvedSubcategoryIds: string[] = [];
    const rawSubcategories = data.subcategories !== undefined ? data.subcategories : data.subcategoryIds;
    if (rawSubcategories !== undefined) {
      try {
        resolvedSubcategoryIds = await resolveSubcategories(
          prisma,
          rawSubcategories,
          resolvedCategoryId,
          resolvedCategory
        );
      } catch (subErr: any) {
        return res.status(subErr.status || 400).json({
          success: false,
          error: subErr.message || "Invalid subcategory selection",
        });
      }
    }

    // Resolve GSTIN & Safety: Never trust client-submitted isGstVerified
    const rawGstin = typeof data.gstin === "string" && data.gstin.trim() ? data.gstin.trim().toUpperCase() : null;
    const isGstVerified = false; // Always starts unverified on public registration

    // Resolve GST Certificate URL & Server-Side Conditional Validation
    let resolvedGstCertificateUrl: string | null = null;
    if (typeof data.gstCertificateUrl === "string" && data.gstCertificateUrl.trim().length > 0) {
      resolvedGstCertificateUrl = data.gstCertificateUrl.trim();
    }

    // Server-Side Conditional GST Certificate Validation:
    // When GSTIN is supplied, non-empty GST certificate document upload is strictly mandatory.
    // When GSTIN is absent/omitted, GST certificate remains optional.
    if (rawGstin && !resolvedGstCertificateUrl) {
      return res.status(400).json({
        success: false,
        error: "GST certificate document upload is required when GSTIN is provided.",
      });
    }

    // Generate unique Tracking ID e.g. HP-EMP-849201
    const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
    const trackingId = `HP-EMP-${randomSuffix}`;

    // SHA-256 Audit Signature
    const hashData = `${trackingId}-${data.pan}-${data.email}-${Date.now()}`;
    const hashSignature = crypto.createHash("sha256").update(hashData).digest("hex");

    // Calculate initial eligibility score (0-100)
    let score = 20; // baseline for complete statutory profile

    // Score: Tenure (based on calendar year if validly supplied)
    if (resolvedEstablishmentYear) {
      const estYear = parseInt(resolvedEstablishmentYear, 10);
      const currentYear = new Date().getFullYear();
      if (!isNaN(estYear) && estYear >= 1900 && estYear <= currentYear) {
        const years = currentYear - estYear;
        if (years >= 10) score += 20;
        else if (years >= 5) score += 15;
        else if (years >= 2) score += 10;
      }
    }

    // Score: Financial Capacity
    const t1 = parseFloat((data.turnoverYear3 || data.turnoverYear1 || "0").replace(/[^0-9.]/g, ""));
    if (resolvedTurnoverBracket === "Above ₹2 Crore" || t1 >= 50000000) {
      score += 30;
    } else if (resolvedTurnoverBracket === "₹50 Lakh – ₹2 Crore" || t1 >= 10000000) {
      score += 20;
    } else if (resolvedTurnoverBracket === "₹10 Lakh – ₹50 Lakh" || t1 >= 2500000) {
      score += 10;
    }

    // Score: Workforce Capacity
    if (resolvedTeamSize === "200+") score += 15;
    else if (resolvedTeamSize === "51-200") score += 10;
    else if (resolvedTeamSize === "11-50") score += 5;

    // Score: Valid GSTIN format (format syntax only, NOT verified registry flag)
    if (rawGstin && GSTIN_REGEX.test(rawGstin)) {
      score += 10;
    }

    if (resolvedWorkExperienceDocUrl) score += 10;
    if (resolvedMsmeDocUrl) score += 5;
    if (data.signatureUrl) score += 5;

    score = Math.min(100, Math.max(10, score));

    // Initial Provisional Tier
    let tier = "CLASS_C";
    if (score >= 75) tier = "CLASS_A";
    else if (score >= 50) tier = "CLASS_B";

    const createData: any = {
      trackingId,
      hashSignature,
      status: "SUBMITTED",
      currentStage,
      tier,
      category: resolvedCategory,
      categoryId: resolvedCategoryId,
      primaryRole: data.primaryRole || "",
      specialization: data.specialization || "",
      skillsDetails: data.skillsDetails || "",
      teamSize: resolvedTeamSize,
      companyName: companyName,
      entityType: data.entityType || "PROPRIETORSHIP",
      establishmentYear: resolvedEstablishmentYear,
      ownerName: data.ownerName || contactName,
      ownerContact: data.ownerContact || phone,
      contactName: contactName,
      designation: data.designation || "Director / Proprietor",
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: data.address || "",
      city: data.city || "Bhilwara",
      district: data.district || "",
      state: data.state || "Rajasthan",
      pincode: data.pincode || "311001",
      gstin: rawGstin,
      isGstVerified: false,
      pan: pan,
      aadharNo: data.aadharNo || null,
      msmeUdyamNo: data.msmeUdyamNo || null,
      bankName: data.bankName || "",
      accountNumber: data.accountNumber || "",
      ifscCode: data.ifscCode || "",
      turnoverBracket: resolvedTurnoverBracket,
      turnoverYear1: data.turnoverYear1 || "",
      turnoverYear2: data.turnoverYear2 || "",
      turnoverYear3: data.turnoverYear3 || "",
      largestOrderValue: data.largestOrderValue || "",
      existingEmpanelments: data.existingEmpanelments || "",
      gstCertificateUrl: resolvedGstCertificateUrl,
      panCardUrl: typeof data.panCardUrl === "string" && data.panCardUrl.trim().length > 0 ? data.panCardUrl.trim() : null,
      bankChequeUrl: typeof data.bankChequeUrl === "string" && data.bankChequeUrl.trim().length > 0 ? data.bankChequeUrl.trim() : null,
      msmeDocUrl: resolvedMsmeDocUrl,
      workExperienceDocUrl: resolvedWorkExperienceDocUrl,
      passportPhotoUrl: data.passportPhotoUrl || null,
      signatureUrl: data.signatureUrl || null,
      signatoryName: data.signatoryName || contactName,
      eligibilityScore: score,
      ipAddress: req.ip || req.socket.remoteAddress || "",
    };

    const application = await prisma.vendorApplication.create({
      data: {
        ...createData,
        ...(resolvedSubcategoryIds.length > 0
          ? {
              subcategories: {
                create: resolvedSubcategoryIds.map((subId) => ({ subcategoryId: subId })),
              },
            }
          : {}),
      },
    });

    // Asynchronously dispatch transactional acknowledgment email
    sendApplicationReceivedEmail({
      email: application.email,
      companyName: application.companyName,
      contactName: application.contactName,
      trackingId: application.trackingId,
      category: application.category || "Unassigned (Pending Classification)",
      tier: application.tier,
      pan: application.pan,
      gstin: application.gstin,
      applicationId: application.id,
    }).catch((mailErr) => {
      console.warn("[EMPANELMENT] Asynchronous confirmation email failed:", mailErr?.message || mailErr);
    });

    logVendorActivity({
      applicationId: application.id,
      actorType: "VENDOR",
      actorName: application.contactName,
      action: "APPLICATION_SUBMITTED",
      details: `Empanelment application submitted online. Tracking ID: ${application.trackingId}`,
    }).catch(() => null);

    return res.status(201).json({
      success: true,
      trackingId,
      tier,
      score,
      status: application.status,
      message: "Application submitted successfully to Hindustan Projects Procurement Board.",
    });
  } catch (err: any) {
    console.error("Empanelment apply error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. Track Application by Tracking ID or Phone
 * GET /api/empanelment/track/:trackingId
 *
 * PUBLIC endpoint — no authentication required.
 * Security (SEC-CRIT-02): The select block intentionally omits all sensitive
 * financial identifiers and internal administrative fields:
 *   - pan, gstin: government financial identifiers — must not be publicly enumerable.
 *   - adminRemarks: internal procurement board notes — must not be public.
 *   - passportPhotoUrl: biometric document — must not be publicly accessible via enumeration.
 *   - ceoSigned, ceoSignedDate: internal approval metadata.
 *
 * NOTE: Full authentication, OTP verification, and rate-limiting are tracked
 * as Phase 3 security improvements (out of scope for this hardening branch).
 */
router.get("/track/:trackingId", async (req: Request, res: Response) => {
  try {
    const raw = String(req.params.trackingId || "").trim();
    if (!raw) {
      return res.status(400).json({ success: false, error: "Tracking ID or Phone is required" });
    }

    const application = await prisma.vendorApplication.findFirst({
      where: {
        OR: [
          { trackingId: { equals: raw, mode: "insensitive" } },
          { phone: { equals: raw } },
        ],
      },
      select: {
        // Public tracking fields — safe to expose without authentication.
        id: true,
        trackingId: true,
        status: true,
        currentStage: true,
        tier: true,
        category: true,
        companyName: true,
        contactName: true,
        city: true,
        state: true,
        isGstVerified: true,
        eligibilityScore: true,
        digitalCertificateUrl: true, // Vendor's own approved certificate — intentionally accessible.
        submittedAt: true,
        approvedAt: true,
        // EXCLUDED (SEC-CRIT-02 — PII / sensitive identifiers):
        // pan: false,               // Government financial identifier — not publicly enumerable.
        // gstin: false,             // Government financial identifier — not publicly enumerable.
        // adminRemarks: false,      // Internal procurement board notes — must remain private.
        // passportPhotoUrl: false,  // Biometric document URL — must not be publicly accessible.
        // ceoSigned: false,         // Internal approval metadata.
        // ceoSignedDate: false,     // Internal approval metadata.
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: `No empanelment record found for '${raw}'. Please check your Reference Code or Mobile Number.`,
      });
    }

    return res.json({
      success: true,
      application,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Validate that a certificate URL uses a safe protocol (https, http, or data:application/pdf).
 * Blocks javascript:, vbscript:, data:text/html, and arbitrary unsafe schemes.
 */
function sanitizePublicCertificateUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("data:text/html")
  ) {
    return null;
  }
  if (lower.startsWith("https://") || lower.startsWith("http://")) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return trimmed;
      }
    } catch {
      return null;
    }
  }
  if (lower.startsWith("data:application/pdf") || lower.startsWith("data:image/")) {
    return trimmed;
  }
  return null;
}

/**
 * 3b. Dedicated Public Smart Partner Verification
 * GET /api/empanelment/verify/:trackingId
 *
 * Exposes strictly minimal public contractor authenticity credentials for Smart Card verification.
 * Zero PII, financial details, contact persons, scores, or internal notes exposed.
 */
router.get("/verify/:trackingId", async (req: Request, res: Response) => {
  try {
    const raw = String(req.params.trackingId || "").trim();
    if (!raw) {
      return res.status(400).json({ success: false, error: "Empanelment Tracking ID is required" });
    }

    const application = await prisma.vendorApplication.findUnique({
      where: { trackingId: raw.toUpperCase() },
      select: {
        trackingId: true,
        status: true,
        companyName: true,
        category: true,
        tier: true,
        city: true,
        state: true,
        approvedAt: true,
        digitalCertificateUrl: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: `No partner credential found for '${raw}'. Please check your Reference Code.`,
      });
    }

    const safeCertificateUrl = sanitizePublicCertificateUrl(application.digitalCertificateUrl);

    return res.json({
      success: true,
      application: {
        trackingId: application.trackingId,
        status: application.status,
        companyName: application.companyName,
        category: application.category,
        tier: application.tier,
        city: application.city,
        state: application.state,
        approvedAt: application.approvedAt,
        digitalCertificateUrl: safeCertificateUrl,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Public: List Active Vendor Categories & Subcategories (Phase 2C.4)
 * GET /api/empanelment/categories
 */
router.get("/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPublicCategories(prisma);
    return res.json({ success: true, categories });
  } catch (err: any) {
    console.error("[CATEGORY API ERROR]", err);
    return res.status(500).json({ success: false, error: "Failed to retrieve categories" });
  }
});

/**
 * 4. Active Public Tenders
 * GET /api/empanelment/tenders
 */
router.get("/tenders", async (req: Request, res: Response) => {
  try {
    const tenders = await prisma.empanelmentTender.findMany({
      where: { status: "ACTIVE" },
      orderBy: { dueDate: "asc" },
      take: 20,
    });

    return res.json({ success: true, count: tenders.length, tenders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 5. Submit Bid for a Tender (SUSPENDED - FAIL CLOSED FOR SECURITY)
 * POST /api/empanelment/tenders/:tenderId/bid
 *
 * SECURITY CONTAINMENT (Phase 2B.3):
 * Public unauthenticated electronic bidding is temporarily suspended while vendor
 * authentication and ownership verification are being implemented.
 * Unconditionally fails closed with HTTP 503 Service Unavailable.
 * Never creates VendorBid records, never increments bidsCount, and does not trust trackingId.
 */
router.post("/tenders/:tenderId/bid", async (_req: Request, res: Response) => {
  return res.status(503).json({
    success: false,
    error: "Electronic tender bidding is temporarily unavailable while portal authentication security is being upgraded. Please contact the Central Procurement Desk for procurement clarification guidance.",
  });
});

/**
 * 6. Generate Daily 24-Hour Site Gate Pass (SUSPENDED - FAIL CLOSED FOR SECURITY)
 * POST /api/empanelment/gate-pass/generate
 *
 * SECURITY CONTAINMENT (Phase 2B.3):
 * Public unauthenticated gate pass generation is temporarily suspended while vendor
 * identity verification is being upgraded.
 * Unconditionally fails closed with HTTP 503 Service Unavailable.
 * Never creates SiteGatePass records, never generates QR pass codes, and does not trust trackingId.
 */
router.post("/gate-pass/generate", async (_req: Request, res: Response) => {
  return res.status(503).json({
    success: false,
    error: "Daily site gate pass self-service generation is temporarily unavailable while access security is being upgraded. Please contact project site administration for approved access clearance.",
  });
});

/**
 * 7. Verify Daily Site Gate Pass (Security Guard QR Scanner)
 * GET /api/empanelment/gate-pass/verify/:passCode
 */
router.get("/gate-pass/verify/:passCode", async (req: Request, res: Response) => {
  try {
    const raw = String(req.params.passCode || "").trim().toUpperCase();
    const pass = await prisma.siteGatePass.findUnique({
      where: { passCode: raw },
      include: {
        vendor: {
          select: {
            companyName: true,
            tier: true,
            contactName: true,
            phone: true,
          },
        },
      },
    });

    if (!pass) {
      return res.status(404).json({
        success: false,
        valid: false,
        error: `Gate Pass '${raw}' not found in Hindustan Projects Security Registry.`,
      });
    }

    const isExpired = new Date() > pass.validTill;
    const isValid = pass.status === "ACTIVE" && !isExpired;

    return res.json({
      success: true,
      valid: isValid,
      isExpired,
      pass: {
        passCode: pass.passCode,
        companyName: pass.vendor.companyName,
        tier: pass.vendor.tier,
        contactName: pass.vendor.contactName,
        phone: pass.vendor.phone,
        supervisor: pass.visitorName,
        visitorName: pass.visitorName,
        workerCount: pass.workerCount,
        personsCount: pass.workerCount,
        vehicleNo: pass.vehicleNo || "N/A",
        vehicleNumber: pass.vehicleNo || "None",
        siteLocation: pass.siteLocation,
        validFrom: pass.validFrom,
        validTill: pass.validTill,
        validDate: pass.validTill,
        status: isValid ? "AUTHORIZED" : isExpired ? "EXPIRED" : pass.status,
        vendor: {
          companyName: pass.vendor.companyName,
          contactName: pass.vendor.contactName,
          phone: pass.vendor.phone,
          tier: pass.vendor.tier,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 8. Submit Support Query / Ticket
 * POST /api/empanelment/tickets
 */
router.post("/tickets", async (req: Request, res: Response) => {
  try {
    const { trackingId, subject, category, priority, message } = req.body;

    const trimmedTrackingId = typeof trackingId === "string" ? trackingId.trim().toUpperCase() : "";
    const trimmedSubject = typeof subject === "string" ? subject.trim() : "";
    const trimmedMessage = typeof message === "string" ? message.trim() : "";
    const validCategory = typeof category === "string" && category.trim().length > 0 ? category.trim() : "General Support";
    const validPriority =
      typeof priority === "string" && ["LOW", "NORMAL", "HIGH", "URGENT"].includes(priority.trim().toUpperCase())
        ? priority.trim().toUpperCase()
        : "NORMAL";

    if (!trimmedTrackingId || !trimmedSubject || !trimmedMessage) {
      return res.status(400).json({
        success: false,
        error: "Tracking ID, Subject, and Message are required",
      });
    }

    const vendor = await prisma.vendorApplication.findUnique({
      where: { trackingId: trimmedTrackingId },
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: "Vendor profile with this Tracking ID was not found",
      });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNo = `HP-TCK-${randomSuffix}`;

    const ticket = await prisma.empanelmentTicket.create({
      data: {
        ticketNo,
        vendorId: vendor.id,
        subject: trimmedSubject,
        category: validCategory,
        priority: validPriority,
        message: trimmedMessage,
        status: "OPEN",
      },
    });

    return res.status(201).json({
      success: true,
      ticketNo: ticket.ticketNo,
      ticket,
      message: "Ticket submitted successfully. Procurement support team will review within 24 business hours.",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================================
// MASTER ADMIN ENDPOINTS (Protected with requirePermission("empanelment"))
// ===================================================================

router.use("/admin", requirePermission("empanelment"));

/**
 * Admin KPI Stats Overview
 * GET /api/empanelment/admin/stats
 */
router.get("/admin/stats", async (req: Request, res: Response) => {
  try {
    const [
      totalApplications,
      pendingVerification,
      approvedPartners,
      rejectedApplications,
      activeTenders,
      totalPassesToday,
    ] = await Promise.all([
      prisma.vendorApplication.count(),
      prisma.vendorApplication.count({
        where: { status: { in: ["SUBMITTED", "UNDER_VERIFICATION", "TECHNICAL_AUDIT", "FINANCIAL_REVIEW"] } },
      }),
      prisma.vendorApplication.count({ where: { status: "APPROVED" } }),
      prisma.vendorApplication.count({ where: { status: "REJECTED" } }),
      prisma.empanelmentTender.count({ where: { status: "ACTIVE" } }),
      prisma.siteGatePass.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return res.json({
      success: true,
      stats: {
        totalApplications,
        pendingVerification,
        approvedPartners,
        rejectedApplications,
        activeTenders,
        totalPassesToday,
        total: totalApplications,
        approved: approvedPartners,
        submitted: pendingVerification,
        todayGatePasses: totalPassesToday,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin Applications Pipeline List
 * GET /api/empanelment/admin/applications
 */
router.get("/admin/applications", async (req: Request, res: Response) => {
  try {
    const { status, category, tier, search } = req.query;

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = String(status);
    }
    if (category && category !== "ALL") {
      where.category = String(category);
    }
    if (tier && tier !== "ALL") {
      where.tier = String(tier);
    }
    if (search && typeof search === "string") {
      where.OR = [
        { trackingId: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
        { gstin: { contains: search, mode: "insensitive" } },
        { pan: { contains: search, mode: "insensitive" } },
      ];
    }

    const applications = await prisma.vendorApplication.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      take: 100,
    });

    return res.json({ success: true, count: applications.length, applications });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin Single Application Detail
 * GET /api/empanelment/admin/applications/:id
 */
router.get("/admin/applications/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const application = await prisma.vendorApplication.findUnique({
      where: { id },
      include: {
        bids: { include: { tender: true } },
        gatePasses: { take: 10, orderBy: { createdAt: "desc" } },
        workOrders: true,
        invoices: true,
        tickets: true,
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    return res.json({ success: true, application });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin Update Application Status & Tier
 * PATCH /api/empanelment/admin/applications/:id/status
 */
router.patch("/admin/applications/:id/status", async (req: Request, res: Response) => {
  try {
    const { status, tier, category, currentStage, adminRemarks, ceoSigned, eligibilityScore } = req.body;

    const id = String(req.params.id);
    const existing = await prisma.vendorApplication.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (tier) updateData.tier = tier;
    if (category !== undefined || req.body.categoryId !== undefined) {
      if (
        (category === null || (typeof category === "string" && category.trim() === "")) &&
        (req.body.categoryId === null || req.body.categoryId === undefined || (typeof req.body.categoryId === "string" && req.body.categoryId.trim() === ""))
      ) {
        updateData.category = null;
        updateData.categoryId = null;
      } else {
        try {
          const categoryRes = await resolveTradeCategory(prisma, {
            categoryId: req.body.categoryId,
            category: category,
          });
          updateData.category = categoryRes.category;
          updateData.categoryId = categoryRes.categoryId;
        } catch (catErr: any) {
          return res.status(catErr.status || 400).json({
            success: false,
            error: catErr.message || "Invalid trade category specified",
          });
        }
      }
    }
    if (currentStage) updateData.currentStage = currentStage;
    if (adminRemarks !== undefined) updateData.adminRemarks = adminRemarks;
    if (eligibilityScore !== undefined) updateData.eligibilityScore = parseInt(eligibilityScore, 10);

    // Safety: Cannot approve partner without assigning an approved trade category
    const targetCategory = updateData.category !== undefined ? updateData.category : existing.category;
    if ((updateData.status === "APPROVED" || ceoSigned === true) && (!targetCategory || targetCategory.trim() === "")) {
      return res.status(400).json({
        success: false,
        error: "Cannot approve partner without assigning an approved trade category.",
      });
    }

    if (ceoSigned === true) {
      updateData.ceoSigned = true;
      updateData.ceoSignedDate = new Date();
      updateData.status = "APPROVED";
      updateData.approvedAt = new Date();
      updateData.currentStage = "Empanelled Partner — Active";
    }

    const updated = await prisma.vendorApplication.update({
      where: { id },
      data: updateData,
    });

    // If subcategoryIds array is supplied, update application subcategories
    if (Array.isArray(req.body.subcategoryIds) && updateData.categoryId) {
      try {
        const validatedSubIds = await resolveSubcategories(
          prisma,
          req.body.subcategoryIds,
          updateData.categoryId,
          updateData.category || existing.category
        );
        await (prisma as any).vendorApplicationSubcategory.deleteMany({
          where: { applicationId: id },
        });
        if (validatedSubIds.length > 0) {
          await (prisma as any).vendorApplicationSubcategory.createMany({
            data: validatedSubIds.map((subId: string) => ({
              applicationId: id,
              subcategoryId: subId,
            })),
          });
        }
      } catch (subErr: any) {
        console.warn("[EMPANELMENT] Subcategory update warning:", subErr?.message || subErr);
      }
    }

    // Auto-provision VendorAccount stub if approved
    if (updated.status === "APPROVED") {
      await createOrGetVendorAccount(updated.id, updated.email).catch(() => null);
    }

    await logVendorActivity({
      applicationId: updated.id,
      actorType: "ADMIN",
      actorName: (req as any).user?.name || "Procurement Officer",
      action: "STATUS_CHANGED",
      details: `Status set to ${updated.status}. Stage: ${updated.currentStage}. Remarks: ${updated.adminRemarks || "None"}`,
    }).catch(() => null);

    // If status changed to APPROVED, REJECTED, or DOCS_REQUESTED, notify the vendor
    if (updated.status === "APPROVED" || updated.status === "REJECTED" || updated.status === "DOCS_REQUESTED") {
      sendApplicationStatusEmail({
        email: updated.email,
        companyName: updated.companyName,
        contactName: updated.contactName,
        trackingId: updated.trackingId,
        status: updated.status as any,
        registrationNo: updated.trackingId,
        tier: updated.tier,
        remarks: updated.adminRemarks || undefined,
        applicationId: updated.id,
      }).catch((mailErr) => {
        console.warn("[EMPANELMENT] Asynchronous status email failed:", mailErr?.message || mailErr);
      });
    }

    return res.json({
      success: true,
      message: "Application status updated successfully",
      application: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Request Document Revision
 * PATCH /api/empanelment/admin/applications/:id/request-revision
 */
router.patch("/admin/applications/:id/request-revision", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { remarks } = req.body;

    const application = await prisma.vendorApplication.findUnique({ where: { id } });
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    const updated = await prisma.vendorApplication.update({
      where: { id },
      data: {
        status: "DOCS_REQUESTED",
        currentStage: "Document Revision Requested",
        adminRemarks: remarks?.trim() || "Please re-upload legible and complete statutory certificates.",
      },
    });

    await logVendorActivity({
      applicationId: id,
      actorType: "ADMIN",
      actorName: (req as any).user?.name || "Procurement Officer",
      action: "DOCS_REVISION_REQUESTED",
      details: remarks?.trim() || "Requested document revision",
    }).catch(() => null);

    sendApplicationStatusEmail({
      email: updated.email,
      companyName: updated.companyName,
      contactName: updated.contactName,
      trackingId: updated.trackingId,
      status: "DOCS_REQUESTED",
      registrationNo: updated.trackingId,
      tier: updated.tier,
      remarks: updated.adminRemarks || undefined,
      applicationId: updated.id,
    }).catch((mailErr) => {
      console.warn("[EMPANELMENT] Docs requested email failed:", mailErr?.message || mailErr);
    });

    return res.json({
      success: true,
      message: "Document revision requested successfully",
      application: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Get Email Logs for Application
 * GET /api/empanelment/admin/applications/:id/emails
 */
router.get("/admin/applications/:id/emails", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const logs = await getEmpanelmentEmailLogs(id);
    return res.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Send Manual Email to Vendor from Review Drawer
 * POST /api/empanelment/admin/applications/:id/send-email
 */
router.post("/admin/applications/:id/send-email", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { subject, htmlBody } = req.body;

    if (!subject?.trim() || !htmlBody?.trim()) {
      return res.status(400).json({ success: false, error: "Subject and message body are required" });
    }

    const application = await prisma.vendorApplication.findUnique({ where: { id } });
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    const adminName = (req as any).user?.name || "Procurement Officer";
    const result = await sendCustomVendorEmail({
      applicationId: id,
      recipientEmail: application.email,
      recipientName: application.contactName,
      subject: subject.trim(),
      htmlBody: htmlBody.trim(),
      adminName,
    });

    await logVendorActivity({
      applicationId: id,
      actorType: "ADMIN",
      actorName: adminName,
      action: "MANUAL_EMAIL_SENT",
      details: `Dispatched direct email: "${subject.trim()}"`,
    }).catch(() => null);

    return res.json({
      success: result.success,
      message: result.success ? "Email dispatched successfully" : "Email recorded in history",
      error: result.error,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Retry Failed Email
 * POST /api/empanelment/admin/emails/:logId/retry
 */
router.post("/admin/emails/:logId/retry", async (req: Request, res: Response) => {
  try {
    const logId = String(req.params.logId);
    const result = await retryEmpanelmentEmail(logId);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error || "Retry failed" });
    }
    return res.json({ success: true, message: "Email resent successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Get Audit Activity History for Application
 * GET /api/empanelment/admin/applications/:id/activity
 */
router.get("/admin/applications/:id/activity", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const logs = await getVendorActivityLogs(id);
    return res.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Invite / Activate Approved Vendor
 * POST /api/empanelment/admin/accounts/invite/:applicationId
 */
router.post("/admin/accounts/invite/:applicationId", async (req: Request, res: Response) => {
  try {
    const applicationId = String(req.params.applicationId);
    const application = await prisma.vendorApplication.findUnique({ where: { id: applicationId } });
    if (!application) {
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    if (application.status !== "APPROVED") {
      return res.status(400).json({
        success: false,
        error: "Only formally APPROVED vendors can be invited to access the vendor portal.",
      });
    }

    await createOrGetVendorAccount(application.id, application.email);
    const { token } = await generateActivationToken(application.id);

    await sendVendorActivationEmail({
      email: application.email,
      contactName: application.contactName,
      companyName: application.companyName,
      activationToken: token,
      applicationId: application.id,
    });

    await logVendorActivity({
      applicationId: application.id,
      actorType: "ADMIN",
      actorName: (req as any).user?.name || "Procurement Officer",
      action: "INVITATION_SENT",
      details: `Dispatched vendor portal activation invitation to ${application.email}`,
    }).catch(() => null);

    return res.json({
      success: true,
      message: `Invitation successfully dispatched to ${application.email}`,
      activationToken: token,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Direct Gate Pass Issuance
 * POST /api/empanelment/admin/gate-passes
 */
router.post("/admin/gate-passes", async (req: Request, res: Response) => {
  try {
    const { applicationId, visitorName, phone, purpose, siteLocation, supervisor, labourCount, vehicleNumber } = req.body;

    if (!applicationId || !visitorName?.trim() || !phone?.trim() || !purpose?.trim() || !siteLocation?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Vendor Application, visitor name, phone, purpose, and site location are required",
      });
    }

    const application = await prisma.vendorApplication.findUnique({ where: { id: applicationId } });
    if (!application) {
      return res.status(404).json({ success: false, error: "Vendor application not found" });
    }

    const passSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const passCode = "HP-GP-" + passSuffix;
    const validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    const gatePass = await prisma.siteGatePass.create({
      data: {
        passCode,
        vendorId: application.id,
        visitorName: visitorName.trim(),
        workerCount: labourCount ? Number(labourCount) : 1,
        vehicleNo: vehicleNumber?.trim() || null,
        siteLocation: siteLocation.trim(),
        validFrom: new Date(),
        validTill: validUntil,
        status: "ACTIVE",
        securityRemarks: `Phone: ${phone.trim()} | Purpose: ${purpose.trim()} | Issued by: ${(req as any).user?.name || "Admin"}`,
      },
    });

    await logVendorActivity({
      applicationId: application.id,
      actorType: "ADMIN",
      actorName: (req as any).user?.name || "Site Security Officer",
      action: "ADMIN_GATE_PASS_ISSUED",
      details: `Admin issued 24-hr gate pass ${passCode} for ${visitorName.trim()} at ${siteLocation.trim()}`,
    }).catch(() => null);

    sendSiteGatePassEmail({
      email: application.email,
      visitorName: visitorName.trim(),
      companyName: application.companyName,
      passCode,
      siteLocation: siteLocation.trim(),
      purpose: purpose.trim(),
      validUntil: validUntil.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      phone: phone.trim(),
      applicationId: application.id,
    }).catch(() => null);

    return res.status(201).json({
      success: true,
      message: "Daily site gate pass issued successfully",
      data: gatePass,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================================
// ADMIN VENDOR CATEGORY & SUBCATEGORY MANAGEMENT (Phase 2C.4)
// ===================================================================

/**
 * Admin: List All Categories with Nested Subcategories & Counts
 * GET /api/empanelment/admin/categories
 */
router.get("/admin/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getAdminCategories(prisma);
    return res.json({ success: true, categories });
  } catch (err: any) {
    console.error("[ADMIN CATEGORIES ERROR]", err);
    return res.status(500).json({ success: false, error: "Failed to retrieve admin categories" });
  }
});

/**
 * Admin: Create New Vendor Category
 * POST /api/empanelment/admin/categories
 */
router.post("/admin/categories", async (req: Request, res: Response) => {
  try {
    const category = await createAdminCategory(prisma, req.body);
    return res.status(201).json({
      success: true,
      category,
      message: "Category created successfully",
    });
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    console.error("[ADMIN CREATE CATEGORY ERROR]", err);
    return res.status(500).json({ success: false, error: "Failed to create category" });
  }
});

/**
 * Admin: Update Vendor Category (Display fields & active status)
 * PATCH /api/empanelment/admin/categories/:id
 */
router.patch("/admin/categories/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const category = await updateAdminCategory(prisma, id, req.body);
    return res.json({
      success: true,
      category,
      message: "Category updated successfully",
    });
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    console.error("[ADMIN UPDATE CATEGORY ERROR]", err);
    return res.status(500).json({ success: false, error: "Failed to update category" });
  }
});

/**
 * Admin: Create Subcategory under Category
 * POST /api/empanelment/admin/categories/:id/subcategories
 */
router.post("/admin/categories/:id/subcategories", async (req: Request, res: Response) => {
  try {
    const categoryId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const subcategory = await createAdminSubcategory(prisma, categoryId, req.body);
    return res.status(201).json({
      success: true,
      subcategory,
      message: "Subcategory created successfully",
    });
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    console.error("[ADMIN CREATE SUBCATEGORY ERROR]", err);
    return res.status(500).json({ success: false, error: "Failed to create subcategory" });
  }
});

/**
 * Admin: Update Subcategory (Display fields & active status)
 * PATCH /api/empanelment/admin/subcategories/:id
 */
router.patch("/admin/subcategories/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const subcategory = await updateAdminSubcategory(prisma, id, req.body);
    return res.json({
      success: true,
      subcategory,
      message: "Subcategory updated successfully",
    });
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    console.error("[ADMIN UPDATE SUBCATEGORY ERROR]", err);
    return res.status(500).json({ success: false, error: "Failed to update subcategory" });
  }
});

/**
 * Admin Tenders CRUD
 */
router.get("/admin/tenders", async (req: Request, res: Response) => {
  try {
    const tenders = await prisma.empanelmentTender.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { bids: true },
        },
      },
    });

    const formatted = tenders.map((t) => ({
      ...t,
      bidsCount: t._count.bids,
    }));

    return res.json({ success: true, count: formatted.length, tenders: formatted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/admin/tenders", async (req: Request, res: Response) => {
  try {
    const { title, category, categoryId, location, estimatedBudget, emdAmount, dueDate, scopeOfWork, documentUrl } = req.body;

    if (!title || (!category && !categoryId) || !dueDate) {
      return res.status(400).json({ success: false, error: "Title, Category, and Due Date are required" });
    }

    const categoryRes = await resolveTradeCategory(
      prisma,
      { categoryId, category },
      { isRequired: true }
    );

    const count = await prisma.empanelmentTender.count();
    const tenderNo = `HP-TND-2026-${String(count + 1).padStart(2, "0")}`;

    const tender = await prisma.empanelmentTender.create({
      data: {
        tenderNo,
        title,
        category: categoryRes.category!,
        categoryId: categoryRes.categoryId!,
        location: location || "Rajasthan",
        estimatedBudget: estimatedBudget || "Disclosed in RFP",
        emdAmount: emdAmount || "Exempted for MSME",
        dueDate: new Date(dueDate),
        scopeOfWork: scopeOfWork || "Detailed in project documents",
        documentUrl: documentUrl || null,
        status: "ACTIVE",
      },
    });

    return res.status(201).json({ success: true, tender });
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

const handleTenderUpdate = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const existing = await prisma.empanelmentTender.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: "Tender not found" });
    }

    const updateData: any = { ...req.body };
    delete updateData.id;

    if (req.body.category !== undefined || req.body.categoryId !== undefined) {
      const categoryRes = await resolveTradeCategory(
        prisma,
        {
          categoryId: req.body.categoryId,
          category: req.body.category,
        },
        { isRequired: true }
      );
      updateData.category = categoryRes.category!;
      updateData.categoryId = categoryRes.categoryId!;
    } else {
      delete updateData.category;
      delete updateData.categoryId;
    }

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const tender = await prisma.empanelmentTender.update({
      where: { id },
      data: updateData,
    });
    return res.json({ success: true, tender });
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
};

router.put("/admin/tenders/:id", handleTenderUpdate);
router.patch("/admin/tenders/:id", handleTenderUpdate);

router.delete("/admin/tenders/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.empanelmentTender.delete({ where: { id } });
    return res.json({ success: true, message: "Tender deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/admin/tenders/:id/bids", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const bids = await prisma.vendorBid.findMany({
      where: { tenderId: id },
      include: {
        vendor: {
          select: {
            companyName: true,
            tier: true,
            contactName: true,
            phone: true,
            email: true,
            city: true,
          },
        },
      },
      orderBy: { bidAmount: "asc" }, // L1 first
    });

    return res.json({ success: true, bids });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin Gate Passes Log
 * GET /api/empanelment/admin/gate-passes
 */
router.get("/admin/gate-passes", async (req: Request, res: Response) => {
  try {
    const rawPasses = await prisma.siteGatePass.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        vendor: {
          select: {
            companyName: true,
            tier: true,
            phone: true,
            contactName: true,
          },
        },
      },
    });

    const passes = rawPasses.map((p) => ({
      ...p,
      supervisor: p.visitorName,
      personsCount: p.workerCount,
      vehicleNumber: p.vehicleNo,
      validDate: p.validTill,
      purpose: "Authorized Site Work & Execution",
    }));

    return res.json({ success: true, passes });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================================
// VENDOR HELPDESK TICKETS ENDPOINTS
// ===================================================================

/**
 * Admin: List All Vendor Helpdesk Tickets
 * GET /api/empanelment/admin/tickets
 */
router.get("/admin/tickets", async (req: Request, res: Response) => {
  try {
    const { status, priority } = req.query;
    const where: any = {};

    if (status && status !== "ALL") where.status = String(status);
    if (priority && priority !== "ALL") where.priority = String(priority);

    const tickets = await prisma.empanelmentTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        vendor: {
          select: {
            companyName: true,
            contactName: true,
            phone: true,
            email: true,
            tier: true,
            trackingId: true,
          },
        },
      },
    });

    return res.json({ success: true, count: tickets.length, tickets });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Update Ticket Status & Send Reply
 * PATCH /api/empanelment/admin/tickets/:id
 */
router.patch("/admin/tickets/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, adminReply, priority } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminReply !== undefined) updateData.adminReply = adminReply;
    if (priority) updateData.priority = priority;

    const ticket = await prisma.empanelmentTicket.update({
      where: { id },
      data: updateData,
      include: {
        vendor: {
          select: {
            email: true,
            companyName: true,
            contactName: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      ticket,
      message: "Support ticket updated successfully",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================================
// WORK ORDERS & MILESTONE INVOICING ENDPOINTS
// ===================================================================

/**
 * Admin: List Work Orders
 * GET /api/empanelment/admin/work-orders
 */
router.get("/admin/work-orders", async (req: Request, res: Response) => {
  try {
    const workOrders = await prisma.vendorWorkOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vendor: {
          select: {
            companyName: true,
            contactName: true,
            phone: true,
            tier: true,
            city: true,
          },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return res.json({ success: true, count: workOrders.length, workOrders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Create New Work Order
 * POST /api/empanelment/admin/work-orders
 */
router.post("/admin/work-orders", async (req: Request, res: Response) => {
  try {
    const {
      vendorId,
      projectName,
      packageTitle,
      contractAmount,
      startDate,
      completionTargetDate,
      contractDocUrl,
    } = req.body;

    if (!vendorId || !projectName || !packageTitle || !contractAmount) {
      return res.status(400).json({
        success: false,
        error: "Vendor, Project Name, Package Title, and Contract Amount are required",
      });
    }

    const count = await prisma.vendorWorkOrder.count();
    const workOrderNo = `HP-WO-2026-${String(count + 1).padStart(3, "0")}`;

    const workOrder = await prisma.vendorWorkOrder.create({
      data: {
        workOrderNo,
        vendorId: String(vendorId),
        projectName,
        packageTitle,
        contractAmount: parseFloat(String(contractAmount)),
        startDate: startDate ? new Date(startDate) : new Date(),
        completionTargetDate: completionTargetDate ? new Date(completionTargetDate) : null,
        progressPercent: 0,
        status: "IN_EXECUTION",
        contractDocUrl: contractDocUrl || null,
      },
      include: {
        vendor: { select: { companyName: true, contactName: true } },
      },
    });

    return res.status(201).json({ success: true, workOrder });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Update Work Order Progress & Status
 * PATCH /api/empanelment/admin/work-orders/:id
 */
router.patch("/admin/work-orders/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { progressPercent, status, completionTargetDate } = req.body;

    const updateData: any = {};
    if (progressPercent !== undefined) updateData.progressPercent = parseInt(progressPercent, 10);
    if (status) updateData.status = status;
    if (completionTargetDate) updateData.completionTargetDate = new Date(completionTargetDate);

    const workOrder = await prisma.vendorWorkOrder.update({
      where: { id },
      data: updateData,
    });

    return res.json({ success: true, workOrder });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: List Invoices
 * GET /api/empanelment/admin/invoices
 */
router.get("/admin/invoices", async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.vendorInvoice.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        vendor: {
          select: {
            companyName: true,
            tier: true,
            phone: true,
            gstin: true,
            pan: true,
          },
        },
        workOrder: {
          select: {
            workOrderNo: true,
            projectName: true,
            packageTitle: true,
          },
        },
      },
    });

    return res.json({ success: true, count: invoices.length, invoices });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Create Milestone Invoice
 * POST /api/empanelment/admin/invoices
 */
router.post("/admin/invoices", async (req: Request, res: Response) => {
  try {
    const { vendorId, workOrderId, invoiceNo, amount, tdsPercent } = req.body;

    if (!vendorId || !invoiceNo || !amount) {
      return res.status(400).json({
        success: false,
        error: "Vendor, Invoice Number, and Amount are required",
      });
    }

    const rawAmount = parseFloat(String(amount));
    const tds = (rawAmount * (parseFloat(String(tdsPercent || "2")))) / 100;
    const net = rawAmount - tds;

    const invoice = await prisma.vendorInvoice.create({
      data: {
        invoiceNo: String(invoiceNo).trim().toUpperCase(),
        vendorId: String(vendorId),
        workOrderId: workOrderId ? String(workOrderId) : null,
        amount: rawAmount,
        tdsDeduction: tds,
        netPayable: net,
        status: "UNDER_REVIEW",
      },
    });

    return res.status(201).json({ success: true, invoice });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Update Invoice Status (Approve / Mark Paid with RTGS)
 * PATCH /api/empanelment/admin/invoices/:id/status
 */
router.patch("/admin/invoices/:id/status", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, rtgsRef } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (rtgsRef) updateData.rtgsRef = rtgsRef;
    if (status === "PAID") updateData.paidAt = new Date();

    const invoice = await prisma.vendorInvoice.update({
      where: { id },
      data: updateData,
    });

    return res.json({ success: true, invoice, message: "Invoice updated successfully" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================================
// EMPANELMENT PORTAL CMS & PAGE BUILDER ENDPOINTS
// ===================================================================

const DEFAULT_EMPANELMENT_CATEGORIES_STR = JSON.stringify([
  {
    id: "c1",
    title: "Civil Construction",
    description: "RCC structural works, masonry, plastering and site civil execution",
    imageUrl: "/images/empanelment/cat-civil-structural.jpg",
    linkUrl: "/empanelment/apply?category=civil-construction",
  },
  {
    id: "c2",
    title: "Electrical & MEP",
    description: "HT/LT electrical installations, substations, panels and cabling",
    imageUrl: "/images/empanelment/cat-electrical-plumbing.jpg",
    linkUrl: "/empanelment/apply?category=electrical-mep",
  },
  {
    id: "c3",
    title: "Plumbing & Sanitation",
    description: "CPVC/PPR water supply, sewerage piping, fixtures and waterproofing",
    imageUrl: "/images/empanelment/cat-electrical-plumbing.jpg",
    linkUrl: "/empanelment/apply?category=plumbing-sanitation",
  },
  {
    id: "c4",
    title: "Fabrication & PEB",
    description: "Pre-engineered buildings (PEB), heavy structural steel and railings",
    imageUrl: "/images/empanelment/cat-civil-structural.jpg",
    linkUrl: "/empanelment/apply?category=fabrication-peb",
  },
  {
    id: "c5",
    title: "Flooring & Finishing",
    description: "Tiles, granite, marble, epoxy flooring, painting and false ceilings",
    imageUrl: "/images/empanelment/cat-interior-finishing.jpg",
    linkUrl: "/empanelment/apply?category=flooring-finishing",
  },
  {
    id: "c6",
    title: "Material Supply",
    description: "Bulk cement, TMT rebars, bricks, AAC blocks, aggregates and sand",
    imageUrl: "/images/empanelment/cat-building-materials.jpg",
    linkUrl: "/empanelment/apply?category=material-supply",
  },
]);

function fallbackIfEmptyArray(raw: string | null | undefined, fallbackStr: string): string {
  if (!raw || (typeof raw === "string" && (raw.trim() === "" || raw.trim() === "[]" || raw.trim() === "null"))) {
    return fallbackStr;
  }
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p) && p.length === 0) return fallbackStr;
    return raw;
  } catch {
    return fallbackStr;
  }
}

/**
 * Public: Get Empanelment Portal CMS Content
 * GET /api/empanelment/content
 */
router.get("/content", async (_req: Request, res: Response) => {
  try {
    let content = await prisma.empanelmentContent.findUnique({
      where: { id: "singleton" },
    });

    if (!content) {
      content = await prisma.empanelmentContent.create({
        data: {
          id: "singleton",
          categoriesList: DEFAULT_EMPANELMENT_CATEGORIES_STR,
        },
      });
    }

    const sanitizedContent = {
      ...content,
      categoriesList: fallbackIfEmptyArray(content.categoriesList, DEFAULT_EMPANELMENT_CATEGORIES_STR),
    };

    return res.json({ success: true, content: sanitizedContent });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin: Update Empanelment Portal CMS Content
 * PUT /api/empanelment/admin/content
 */
router.put("/admin/content", async (req: Request, res: Response) => {
  try {
    const data = req.body;
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;

    const updated = await prisma.empanelmentContent.upsert({
      where: { id: "singleton" },
      create: { id: "singleton", ...data },
      update: data,
    });

    return res.json({
      success: true,
      content: updated,
      message: "Empanelment Portal CMS updated successfully",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
