import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { authGuard } from "../middleware/authGuard";
import crypto from "crypto";

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
// PUBLIC VENDOR ENDPOINTS
// ===================================================================

/**
 * 1. GSTIN Auto-Decoder & PAN extraction
 * POST /api/empanelment/gst-verify
 */
router.post("/gst-verify", (req: Request, res: Response) => {
  try {
    const raw = (req.body?.gstin || "").trim().toUpperCase();
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!raw || raw.length !== 15 || !gstinRegex.test(raw)) {
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

    if (!data.companyName || !data.contactName || !data.phone || !data.email || !data.pan) {
      return res.status(400).json({
        success: false,
        error: "Mandatory fields missing (Company Name, Contact Person, Phone, Email, PAN)",
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
    const estYear = parseInt(data.establishmentYear || "2024", 10);
    const yearsInBusiness = Math.max(0, new Date().getFullYear() - estYear);

    if (yearsInBusiness >= 10) score += 20;
    else if (yearsInBusiness >= 5) score += 15;
    else if (yearsInBusiness >= 2) score += 10;

    const t1 = parseFloat((data.turnoverYear3 || data.turnoverYear1 || "0").replace(/[^0-9.]/g, ""));
    if (t1 >= 50000000) score += 30; // 5 Cr+
    else if (t1 >= 10000000) score += 20; // 1 Cr+
    else if (t1 >= 2500000) score += 10; // 25 Lakh+

    if (data.gstin && data.isGstVerified) score += 15;
    if (data.workExperienceDocUrl) score += 10;
    if (data.signatureUrl) score += 5;

    score = Math.min(100, Math.max(10, score));

    // Initial Provisional Tier
    let tier = "CLASS_C";
    if (score >= 75) tier = "CLASS_A";
    else if (score >= 50) tier = "CLASS_B";

    const application = await prisma.vendorApplication.create({
      data: {
        trackingId,
        hashSignature,
        status: "SUBMITTED",
        currentStage: "Document Audit & Compliance Verification",
        tier,
        category: data.category || "Civil Construction",
        primaryRole: data.primaryRole || "",
        specialization: data.specialization || "",
        skillsDetails: data.skillsDetails || "",
        teamSize: data.teamSize || "1-10",
        companyName: data.companyName,
        entityType: data.entityType || "PROPRIETORSHIP",
        establishmentYear: data.establishmentYear || "",
        ownerName: data.ownerName || data.contactName,
        ownerContact: data.ownerContact || data.phone,
        contactName: data.contactName,
        designation: data.designation || "Director / Proprietor",
        email: data.email.toLowerCase().trim(),
        phone: data.phone.trim(),
        address: data.address || "",
        city: data.city || "Bhilwara",
        district: data.district || "",
        state: data.state || "Rajasthan",
        pincode: data.pincode || "311001",
        gstin: data.gstin ? data.gstin.toUpperCase().trim() : null,
        isGstVerified: Boolean(data.isGstVerified),
        pan: data.pan.toUpperCase().trim(),
        aadharNo: data.aadharNo || null,
        msmeUdyamNo: data.msmeUdyamNo || null,
        bankName: data.bankName || "",
        accountNumber: data.accountNumber || "",
        ifscCode: data.ifscCode || "",
        turnoverYear1: data.turnoverYear1 || "",
        turnoverYear2: data.turnoverYear2 || "",
        turnoverYear3: data.turnoverYear3 || "",
        largestOrderValue: data.largestOrderValue || "",
        existingEmpanelments: data.existingEmpanelments || "",
        gstCertificateUrl: data.gstCertificateUrl || null,
        panCardUrl: data.panCardUrl || null,
        bankChequeUrl: data.bankChequeUrl || null,
        workExperienceDocUrl: data.workExperienceDocUrl || null,
        passportPhotoUrl: data.passportPhotoUrl || null,
        signatureUrl: data.signatureUrl || null,
        signatoryName: data.signatoryName || data.contactName,
        eligibilityScore: score,
        ipAddress: req.ip || req.socket.remoteAddress || "",
      },
    });

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
        gstin: true,
        pan: true,
        isGstVerified: true,
        eligibilityScore: true,
        adminRemarks: true,
        ceoSigned: true,
        ceoSignedDate: true,
        digitalCertificateUrl: true,
        passportPhotoUrl: true,
        submittedAt: true,
        approvedAt: true,
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
 * 5. Submit Bid for a Tender
 * POST /api/empanelment/tenders/:tenderId/bid
 */
router.post("/tenders/:tenderId/bid", async (req: Request, res: Response) => {
  try {
    const tenderId = String(req.params.tenderId);
    const { trackingId, bidAmount, proposedDays, remarks } = req.body;

    if (!trackingId || !bidAmount) {
      return res.status(400).json({ success: false, error: "Tracking ID and Bid Amount are required" });
    }

    const vendor = await prisma.vendorApplication.findUnique({
      where: { trackingId: trackingId.trim().toUpperCase() },
    });

    if (!vendor) {
      return res.status(404).json({ success: false, error: "Vendor registration not found" });
    }

    if (vendor.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        error: "Only APPROVED empanelled partners can bid on active tenders. Your application status is: " + vendor.status,
      });
    }

    const bid = await prisma.vendorBid.create({
      data: {
        tenderId,
        vendorId: vendor.id,
        bidAmount: parseFloat(bidAmount),
        proposedDays: proposedDays ? parseInt(proposedDays, 10) : null,
        remarks: remarks || "",
        status: "UNDER_REVIEW",
      },
    });

    await prisma.empanelmentTender.update({
      where: { id: tenderId },
      data: { bidsCount: { increment: 1 } },
    });

    return res.status(201).json({
      success: true,
      message: "Commercial bid submitted successfully for tender review.",
      bidId: bid.id,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 6. Generate Daily 24-Hour Site Gate Pass (Approved Vendors Only)
 * POST /api/empanelment/gate-pass/generate
 */
router.post("/gate-pass/generate", async (req: Request, res: Response) => {
  try {
    const { trackingId, visitorName, workerCount, vehicleNo, siteLocation } = req.body;

    if (!trackingId || !visitorName || !siteLocation) {
      return res.status(400).json({
        success: false,
        error: "Tracking ID, Visitor/Supervisor Name, and Site Location are required",
      });
    }

    const vendor = await prisma.vendorApplication.findUnique({
      where: { trackingId: trackingId.trim().toUpperCase() },
    });

    if (!vendor) {
      return res.status(404).json({ success: false, error: "Vendor tracking record not found" });
    }

    if (vendor.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        error: "Only Approved Empanelled Partners can generate daily site gate passes.",
      });
    }

    const passSuffix = Math.floor(10000 + Math.random() * 90000).toString();
    const passCode = `HP-GP-${passSuffix}`;
    const validTill = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours valid

    const pass = await prisma.siteGatePass.create({
      data: {
        passCode,
        vendorId: vendor.id,
        visitorName,
        workerCount: workerCount ? parseInt(workerCount, 10) : 1,
        vehicleNo: vehicleNo || null,
        siteLocation,
        validTill,
        status: "ACTIVE",
      },
    });

    return res.status(201).json({
      success: true,
      pass: {
        passCode: pass.passCode,
        companyName: vendor.companyName,
        visitorName: pass.visitorName,
        workerCount: pass.workerCount,
        vehicleNo: pass.vehicleNo,
        siteLocation: pass.siteLocation,
        validTill: pass.validTill,
        status: pass.status,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
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
        supervisor: pass.visitorName,
        workerCount: pass.workerCount,
        vehicleNo: pass.vehicleNo || "N/A",
        siteLocation: pass.siteLocation,
        validFrom: pass.validFrom,
        validTill: pass.validTill,
        status: isValid ? "AUTHORIZED" : isExpired ? "EXPIRED" : pass.status,
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
    const { trackingId, subject, category, message } = req.body;

    if (!trackingId || !subject || !message) {
      return res.status(400).json({ success: false, error: "Tracking ID, Subject, and Message are required" });
    }

    const vendor = await prisma.vendorApplication.findUnique({
      where: { trackingId: trackingId.trim().toUpperCase() },
    });

    if (!vendor) {
      return res.status(404).json({ success: false, error: "Vendor record not found" });
    }

    const ticketNo = `HP-TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket = await prisma.empanelmentTicket.create({
      data: {
        ticketNo,
        vendorId: vendor.id,
        subject,
        category: category || "General Support",
        message,
        status: "OPEN",
      },
    });

    return res.status(201).json({
      success: true,
      ticketNo: ticket.ticketNo,
      message: "Ticket registered. Procurement helpdesk will revert shortly.",
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ===================================================================
// MASTER ADMIN ENDPOINTS (Protected with authGuard)
// ===================================================================

router.use("/admin", authGuard);

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
    const { status, tier, currentStage, adminRemarks, ceoSigned, eligibilityScore } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (tier) updateData.tier = tier;
    if (currentStage) updateData.currentStage = currentStage;
    if (adminRemarks !== undefined) updateData.adminRemarks = adminRemarks;
    if (eligibilityScore !== undefined) updateData.eligibilityScore = parseInt(eligibilityScore, 10);

    if (ceoSigned === true) {
      updateData.ceoSigned = true;
      updateData.ceoSignedDate = new Date();
      updateData.status = "APPROVED";
      updateData.approvedAt = new Date();
      updateData.currentStage = "Empanelled Partner — Active";
    }

    const id = String(req.params.id);
    const updated = await prisma.vendorApplication.update({
      where: { id },
      data: updateData,
    });

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
 * Admin Tenders CRUD
 */
router.post("/admin/tenders", async (req: Request, res: Response) => {
  try {
    const { title, category, location, estimatedBudget, emdAmount, dueDate, scopeOfWork, documentUrl } = req.body;

    if (!title || !category || !dueDate) {
      return res.status(400).json({ success: false, error: "Title, Category, and Due Date are required" });
    }

    const count = await prisma.empanelmentTender.count();
    const tenderNo = `HP-TND-2026-${String(count + 1).padStart(2, "0")}`;

    const tender = await prisma.empanelmentTender.create({
      data: {
        tenderNo,
        title,
        category,
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
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put("/admin/tenders/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const tender = await prisma.empanelmentTender.update({
      where: { id },
      data: req.body,
    });
    return res.json({ success: true, tender });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

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
    const passes = await prisma.siteGatePass.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        vendor: {
          select: {
            companyName: true,
            tier: true,
            phone: true,
          },
        },
      },
    });

    return res.json({ success: true, passes });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
