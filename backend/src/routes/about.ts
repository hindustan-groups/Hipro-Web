import { Router, Request, Response } from "express";
import { prisma } from "../lib/db";
import { adminGuard } from "../middleware/authGuard";
import { getSessionUser } from "../lib/auth";

const router = Router();

// Allowed fields whitelist for PUT / PATCH mutations
const ALLOWED_FIELDS = new Set([
  "status",
  "publishedAt",
  "heroBadge",
  "heroHeadingPrefix",
  "heroHeadingAccent",
  "heroHeadingSuffix",
  "heroDescription",
  "heroHighlights",
  "heroPrimaryCtaText",
  "heroSecondaryCtaText",
  "executiveBadge",
  "executiveTitle",
  "executiveStatement",
  "founderImage",
  "founderImageAlt",
  "companyFacts",
  "missionTag",
  "missionTitle",
  "missionDescription",
  "visionTag",
  "visionTitle",
  "visionDescription",
  "engineeringPrinciples",
  "executionStages",
  "capabilitiesSectors",
  "qualityHeading",
  "qualitySubtitle",
  "qualityCommitments",
  "regionalHeading",
  "regionalDescription",
  "regionalBullets",
  "metaTitle",
  "metaDescription",
  "canonicalUrl",
  "targetLocation",
  "geoKeywords",
  "ogTitle",
  "ogDescription",
  "ogImage",
  "twitterTitle",
  "twitterDescription",
  "twitterImage",
]);

// Verified default fallback data
const DEFAULT_ABOUT_DATA = {
  id: "singleton",
  status: "published",
  publishedAt: new Date(),
  heroBadge: "Engineering · Construction · Infrastructure · Est. 2019",
  heroHeadingPrefix: "Engineering",
  heroHeadingAccent: "Precision.",
  heroHeadingSuffix: "Built for Execution.",
  heroDescription:
    "Hindustan Projects (HiPRO) is an engineering, construction, and infrastructure firm headquartered in Bhilwara, Rajasthan. We deliver integrated architectural planning, digital surveying, turnkey civil construction, and project management designed around structural stability, disciplined coordination, and long-term value.",
  heroHighlights: JSON.stringify([
    { label: "Established", value: "2019" },
    { label: "Headquarters", value: "Bhilwara, Rajasthan" },
    { label: "Core Focus", value: "Engineering · Construction · Infrastructure" },
    { label: "Disciplines", value: "6 Verified Practice Areas" },
  ]),
  heroPrimaryCtaText: "Explore Capabilities",
  heroSecondaryCtaText: "Estimate Build Cost",
  executiveBadge: "Executive Leadership",
  executiveTitle: "Committed to Engineering Discipline & Responsible Site Execution",
  executiveStatement: JSON.stringify([
    "At Hindustan Projects, our work begins with the understanding that every structure represents a long-term commitment to safety, capital responsibility, and client trust.",
    "From our headquarters in Bhilwara, we prioritize transparent coordination, disciplined on-site supervision, and close alignment between architectural planning and field construction.",
    "By integrating land surveying, structural coordination, civil execution, and project consultancy under one cohesive team, we ensure projects proceed with clarity from initial assessment to milestone handover.",
  ]),
  founderImage: null,
  founderImageAlt: "Yogesh Kharol, Founder & Director",
  companyFacts: JSON.stringify([
    { label: "Legal / Brand Name", value: "Hindustan Projects (HiPRO)" },
    { label: "Year Established", value: "2019" },
    { label: "Corporate Headquarters", value: "Opposite Mukherji Park, Above Bhagwati Coffee House, Bhopal Ganj, Bhilwara, Rajasthan 311001" },
    { label: "Primary Operating Region", value: "Bhilwara, Mewar Region & Rajasthan" },
    { label: "Core Industry Focus", value: "Civil Engineering, Turnkey Construction & Infrastructure" },
    { label: "Core Engineering Disciplines", value: "6 Verified Practice Areas (Planning, Civil, Surveying, Interiors, ETP/STP, PMC)" },
    { label: "Project Delivery Model", value: "Turnkey Civil Execution, Architectural Planning & Project Management Consultancy" },
    { label: "Corporate Ecosystem", value: "Hindustan Projects, Hindustan Empanelment, HiPro IT Services, HiPro Marketing" },
  ]),
  missionTag: "Corporate Mission",
  missionTitle: "Engineered For Durability",
  missionDescription:
    "To deliver structurally sound, meticulously planned, and enduring construction and infrastructure projects through disciplined engineering, practical site coordination, and transparent client communication.",
  visionTag: "Corporate Vision",
  visionTitle: "Trusted Regional Partner",
  visionDescription:
    "To serve as Rajasthan's premier, dependable engineering and turnkey construction partner, recognized for uncompromising structural reliability, professional ethics, and execution excellence.",
  engineeringPrinciples: JSON.stringify([
    { title: "Engineering-Led Planning", desc: "Every project is grounded in rigorous spatial assessment and structural analysis before groundwork commences." },
    { title: "Quality-Conscious Construction", desc: "Maintaining systematic site supervision, strict material evaluation, and structural discipline at every construction phase." },
    { title: "Transparent Coordination", desc: "Clear documentation, milestone-based communication, and open operational tracking throughout project lifecycles." },
    { title: "Practical Project Planning", desc: "Designing buildable, realistic architectural and civil solutions tailored to local site conditions and regional requirements." },
    { title: "Responsible Site Execution", desc: "Prioritizing on-site responsibility, structured team coordination, and dedicated supervisory attention." },
    { title: "Long-Term Structural Value", desc: "Constructing residential, commercial, and industrial structures engineered for durability and enduring performance." },
  ]),
  executionStages: JSON.stringify([
    { step: "01", title: "Survey & Site Measurements", desc: "Topographic assessment, precise boundary demarcations, contour mapping, and site level evaluations.", serviceName: "Surveying & Site Measurements", serviceSlug: "surveying-site-measurements" },
    { step: "02", title: "Architecture & Engineering Coordination", desc: "Detailed spatial layouts, 3D architectural perspectives, structural load coordination, and municipal sanction drawings.", serviceName: "Architecture & Planning", serviceSlug: "architecture-planning" },
    { step: "03", title: "Construction & Project Execution", desc: "Heavy RCC framework execution, brickwork, civil masonry, structural fabrication, and milestone-tracked site works.", serviceName: "Professional Construction Services", serviceSlug: "professional-construction-services" },
    { step: "04", title: "Finishing, Coordination & Handover", desc: "Facade treatments, interior fit-outs, MEP integration, quality inspections, and milestone handover.", serviceName: "Interior & Exterior Design", serviceSlug: "interior-exterior-design" },
  ]),
  capabilitiesSectors: JSON.stringify([
    { sector: "Commercial Developments", description: "Corporate office spaces, multi-storey commercial complexes, and retail developments built for functional flow and durability.", services: ["Architecture & Planning", "Professional Construction Services"], primarySlug: "professional-construction-services" },
    { sector: "Industrial & Water Infrastructure", description: "Factory floor layouts, industrial warehousing sheds, and specialized civil structures for effluent and sewage water treatment plants (ETP/STP).", services: ["Water Treatment Plant Construction", "Professional Construction Services"], primarySlug: "water-treatment-plant-construction" },
    { sector: "Residential Construction", description: "Turnkey residential bungalows, independent villas, and luxury residential interior/exterior finishing engineered for modern living.", services: ["Architecture & Planning", "Interior & Exterior Design"], primarySlug: "interior-exterior-design" },
    { sector: "Engineering Consultancy & Surveying", description: "Precision digital land surveying, contour mapping, project management consultancy (PMC), cost estimation, and technical advisory.", services: ["Surveying & Site Measurements", "Project Management & Consultancy"], primarySlug: "surveying-site-measurements" },
  ]),
  qualityHeading: "Committed to Quality & Responsible Engineering",
  qualitySubtitle:
    "Every building represents significant capital investment and enduring responsibility. We approach each phase with disciplined site supervision and transparent coordination.",
  qualityCommitments: JSON.stringify([
    { title: "Planned Execution", desc: "Structured scheduling and phase-wise coordination ensure predictable milestone delivery without haphazard site shortcuts." },
    { title: "Supervised Quality", desc: "Dedicated on-site supervision oversees material handling, structural reinforcement, and concrete placement standards." },
    { title: "Systematic Material Verification", desc: "Checking steel grades, cement freshness, aggregate quality, and mix proportions at every execution phase." },
    { title: "Accountable Communication", desc: "Regular status reporting and transparent site coordination keep project owners informed from groundwork to handover." },
  ]),
  regionalHeading: "Headquartered in Bhilwara. Serving Rajasthan.",
  regionalDescription:
    "Headquartered in the vibrant industrial center of Bhilwara, Hindustan Projects brings deep familiarity with Rajasthan's soil variations, local building bylaws, and regional material supply chains. Our central location enables responsive on-site coordination and close project supervision across the Mewar region and surrounding districts.",
  regionalBullets: JSON.stringify([
    "Familiarity with regional soil profiles, structural foundation needs, and Rajasthan climate conditions.",
    "Active coordination with local municipal sanction processes and statutory setback guidelines.",
    "Direct access to regional stone, masonry, cement, and steel supply chains for predictable project procurement.",
  ]),
  metaTitle: "About Us | Hindustan Projects (HiPRO) — Engineering & Construction",
  metaDescription:
    "Hindustan Projects (HiPRO) is an engineering, turnkey construction, and infrastructure firm headquartered in Bhilwara, Rajasthan. Delivering disciplined civil execution, architectural planning, and precision surveying since 2019.",
  canonicalUrl: "/about",
  targetLocation: "Bhilwara, Rajasthan",
  geoKeywords: "construction company Bhilwara, civil engineering Rajasthan, turnkey construction Mewar",
  ogTitle: "About Us | Hindustan Projects (HiPRO) — Engineering & Construction",
  ogDescription: "Engineering, turnkey civil construction, and infrastructure solutions based in Bhilwara, Rajasthan.",
  ogImage: "/logo.jpg",
  twitterTitle: "About Us | Hindustan Projects (HiPRO) — Engineering & Construction",
  twitterDescription: "Engineering, turnkey civil construction, and infrastructure solutions based in Bhilwara, Rajasthan.",
  twitterImage: "/logo.jpg",
};

/**
 * Validate that a value is a valid JSON string representing an array
 */
function validateJsonArray(val: any, fieldName: string): { valid: boolean; error?: string; parsed?: any[] } {
  if (val === undefined || val === null) return { valid: true };
  let parsed: any;
  if (typeof val === "string") {
    try {
      parsed = JSON.parse(val);
    } catch {
      return { valid: false, error: `${fieldName} must be a valid JSON string` };
    }
  } else if (Array.isArray(val)) {
    parsed = val;
  } else {
    return { valid: false, error: `${fieldName} must be an array or JSON string of an array` };
  }

  if (!Array.isArray(parsed)) {
    return { valid: false, error: `${fieldName} must be an array` };
  }
  return { valid: true, parsed };
}

// GET /api/about — Public read with preview support for admins
router.get("/", async (req: Request, res: Response) => {
  try {
    const isPreview = req.query.preview === "true" || req.query.all === "true";
    let isAdmin = false;

    if (isPreview) {
      try {
        const user = await getSessionUser(req);
        if (user && user.role === "admin") {
          isAdmin = true;
        }
      } catch {
        isAdmin = false;
      }
    }

    const content = await prisma.aboutPageContent.findUnique({
      where: { id: "singleton" },
    });

    if (!content) {
      // If no record exists, return default fallback
      return res.json({
        success: true,
        data: DEFAULT_ABOUT_DATA,
        isFallback: true,
      });
    }

    // If caller is an authenticated admin requesting preview/all, return record regardless of status
    if (isAdmin && isPreview) {
      return res.json({
        success: true,
        data: content,
        isPreview: true,
      });
    }

    // Public rule: Only published content is visible publicly
    if (content.status !== "published") {
      return res.json({
        success: true,
        data: DEFAULT_ABOUT_DATA,
        isFallback: true,
        reason: "Content is in draft or unpublished status",
      });
    }

    return res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("[GET /api/about] Error fetching about content:", error);
    return res.json({
      success: true,
      data: DEFAULT_ABOUT_DATA,
      isFallback: true,
    });
  }
});

// PUT / PATCH /api/about — Admin protected mutation
const handleMutation = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    if (!body || typeof body !== "object") {
      return res.status(400).json({ success: false, error: "Invalid request body" });
    }

    // System / metadata fields that can be safely ignored if sent by client
    const SYSTEM_METADATA_FIELDS = new Set([
      "id",
      "_id",
      "publishedAt",
      "createdAt",
      "updatedAt",
      "isFallback",
    ]);

    // Strict field whitelist: Reject unexpected fields
    const unknownKeys: string[] = [];
    for (const key of Object.keys(body)) {
      if (!ALLOWED_FIELDS.has(key) && !SYSTEM_METADATA_FIELDS.has(key)) {
        unknownKeys.push(key);
      }
    }
    if (unknownKeys.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Unexpected fields rejected: ${unknownKeys.join(", ")}`,
      });
    }

    // Status validation
    if (body.status !== undefined) {
      const validStatuses = new Set(["draft", "published", "unpublished"]);
      if (!validStatuses.has(body.status)) {
        return res.status(400).json({
          success: false,
          error: "status must be one of: 'draft', 'published', 'unpublished'",
        });
      }
    }

    // Length validations
    if (body.heroHeadingPrefix && typeof body.heroHeadingPrefix === "string" && body.heroHeadingPrefix.length > 80) {
      return res.status(400).json({ success: false, error: "heroHeadingPrefix must be 80 characters or fewer" });
    }
    if (body.heroHeadingAccent && typeof body.heroHeadingAccent === "string" && body.heroHeadingAccent.length > 80) {
      return res.status(400).json({ success: false, error: "heroHeadingAccent must be 80 characters or fewer" });
    }
    if (body.heroHeadingSuffix && typeof body.heroHeadingSuffix === "string" && body.heroHeadingSuffix.length > 80) {
      return res.status(400).json({ success: false, error: "heroHeadingSuffix must be 80 characters or fewer" });
    }
    if (body.metaTitle && typeof body.metaTitle === "string" && body.metaTitle.length > 150) {
      return res.status(400).json({ success: false, error: "metaTitle must be 150 characters or fewer" });
    }
    if (body.metaDescription && typeof body.metaDescription === "string" && body.metaDescription.length > 400) {
      return res.status(400).json({ success: false, error: "metaDescription must be 400 characters or fewer" });
    }

    // JSON fields validation & normalization
    const jsonFields = [
      "heroHighlights",
      "executiveStatement",
      "companyFacts",
      "engineeringPrinciples",
      "executionStages",
      "capabilitiesSectors",
      "qualityCommitments",
      "regionalBullets",
    ];

    const imageFields = new Set(["founderImage", "ogImage", "twitterImage"]);

    const sanitizedData: Record<string, any> = {};

    for (const key of Object.keys(body)) {
      if (ALLOWED_FIELDS.has(key)) {
        let val = body[key];
        if (jsonFields.includes(key)) {
          const check = validateJsonArray(val, key);
          if (!check.valid) {
            return res.status(400).json({ success: false, error: check.error });
          }
          // Enforce max 6 engineering principles
          if (key === "engineeringPrinciples" && check.parsed && check.parsed.length > 6) {
            return res.status(400).json({
              success: false,
              error: "engineeringPrinciples cannot have more than 6 items",
            });
          }
          // Ensure it is stored as a clean JSON string
          sanitizedData[key] = typeof val === "string" ? val : JSON.stringify(val);
        } else if (imageFields.has(key)) {
          // Normalize image fields: non-empty string or null
          sanitizedData[key] = (typeof val === "string" && val.trim().length > 0) ? val.trim() : null;
        } else if (key === "publishedAt") {
          if (val) {
            try {
              sanitizedData.publishedAt = new Date(val);
            } catch {
              /* ignore invalid date parse */
            }
          }
        } else {
          // Plain text field sanitization (prevent arbitrary HTML script injections)
          if (typeof val === "string") {
            val = val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").trim();
          }
          sanitizedData[key] = val;
        }
      }
    }

    // Update publishedAt timestamp if status is being set to published
    if (sanitizedData.status === "published") {
      sanitizedData.publishedAt = new Date();
    }

    // Idempotent upsert into singleton row
    const updated = await prisma.aboutPageContent.upsert({
      where: { id: "singleton" },
      update: sanitizedData,
      create: {
        ...DEFAULT_ABOUT_DATA,
        ...sanitizedData,
        id: "singleton",
      },
    });

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    console.error("[PUT/PATCH /api/about] Error updating about content:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to update About content",
    });
  }
};

router.put("/", adminGuard, handleMutation);
router.patch("/", adminGuard, handleMutation);

export default router;
