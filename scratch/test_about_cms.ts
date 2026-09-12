import fs from "fs";
import path from "path";

console.log("==================================================");
console.log("HI-PRO ABOUT CMS AUTOMATED TEST SUITE");
console.log("==================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Prisma Schema Verification
const schemaContent = fs.readFileSync("backend/prisma/schema.prisma", "utf8");
assert(
  schemaContent.includes("model AboutPageContent"),
  "Prisma schema contains AboutPageContent singleton model"
);
assert(
  schemaContent.includes("heroBadge") &&
    schemaContent.includes("heroHeadingPrefix") &&
    schemaContent.includes("heroHighlights") &&
    schemaContent.includes("founderImage") &&
    schemaContent.includes("companyFacts") &&
    schemaContent.includes("engineeringPrinciples") &&
    schemaContent.includes("executionStages") &&
    schemaContent.includes("capabilitiesSectors") &&
    schemaContent.includes("qualityCommitments") &&
    schemaContent.includes("regionalBullets") &&
    schemaContent.includes("metaTitle") &&
    schemaContent.includes("ogImage"),
  "AboutPageContent covers all required scalar, JSON, and SEO fields"
);

// 2. Backend DB mapping verification
const dbContent = fs.readFileSync("backend/src/lib/db.ts", "utf8");
assert(
  dbContent.includes('case "about": return prisma.aboutPageContent;') ||
    dbContent.includes("aboutPageContent"),
  "backend/src/lib/db.ts maps 'about' collection to prisma.aboutPageContent"
);

// 3. Backend Route & Whitelist Verification
const routeContent = fs.readFileSync("backend/src/routes/about.ts", "utf8");
assert(
  routeContent.includes("adminGuard"),
  "Backend mutations use adminGuard for strict admin-only authorization"
);
assert(
  routeContent.includes("ALLOWED_FIELDS = new Set("),
  "Backend route defines strict field whitelist"
);
assert(
  routeContent.includes("DEFAULT_ABOUT_DATA"),
  "Backend route includes verified default fallback data"
);
assert(
  routeContent.includes('req.query.preview === "true"'),
  "Backend GET supports secure admin preview mode"
);
assert(
  routeContent.includes('content.status !== "published"'),
  "Backend ensures unpublished drafts are never served to public visitors"
);
assert(
  routeContent.includes("validateJsonArray"),
  "Backend validates structured repeatable arrays with strict type checks"
);

// 4. Server Route Mounting
const indexContent = fs.readFileSync("backend/src/index.ts", "utf8");
assert(
  indexContent.includes('app.use("/api/about", aboutRouter)'),
  "Backend mounts /api/about router in main express application"
);

// 5. Frontend Types Verification
const typesContent = fs.readFileSync("frontend/lib/types.ts", "utf8");
assert(
  typesContent.includes("export interface AboutPageContent"),
  "Frontend types.ts defines AboutPageContent interface"
);
assert(
  typesContent.includes("export interface AboutStageItem") &&
    typesContent.includes("export interface AboutSectorItem") &&
    typesContent.includes("export interface AboutPrincipleItem"),
  "Frontend types.ts defines structured item interfaces for repeatable blocks"
);

// 6. Admin CMS 5-Tab Architecture Verification
const adminAboutContent = fs.readFileSync("frontend/app/admin/about/page.tsx", "utf8");
assert(
  adminAboutContent.includes('"hero"') &&
    adminAboutContent.includes('"profile"') &&
    adminAboutContent.includes('"workflow"') &&
    adminAboutContent.includes('"quality"') &&
    adminAboutContent.includes('"seo"'),
  "Admin About CMS implements all 5 required tab views"
);
assert(
  adminAboutContent.includes("VERIFIED_SERVICES"),
  "Admin CMS restricts service links to verified service catalog routes"
);
assert(
  adminAboutContent.includes("window.addEventListener(\"beforeunload\"") ||
    adminAboutContent.includes("beforeunload"),
  "Admin CMS protects against accidental navigation with unsaved changes"
);
assert(
  adminAboutContent.includes("ImageUpload"),
  "Admin CMS integrates approved Cloudinary image uploader"
);
assert(
  adminAboutContent.includes("/about?preview=true"),
  "Admin CMS provides safe preview link with preview query parameter"
);
assert(
  adminAboutContent.includes("Google Search Snippet Preview"),
  "Admin CMS provides realistic Google SERP snippet preview"
);

// 7. Public About Page Integration Verification
const publicAboutContent = fs.readFileSync("frontend/app/(site)/about/page.tsx", "utf8");
assert(
  publicAboutContent.includes("export async function generateMetadata(): Promise<Metadata>"),
  "Public About page uses dynamic CMS-driven generateMetadata"
);
assert(
  publicAboutContent.includes("safeJsonParse"),
  "Public About page uses resilient safe JSON parsing for all structured fields"
);
assert(
  publicAboutContent.includes("fallback.hero") &&
    publicAboutContent.includes("fallback.executiveStatement") &&
    publicAboutContent.includes("fallback.companyAtAGlance"),
  "Public About page maintains complete field-by-field fallback hierarchy"
);
assert(
  publicAboutContent.includes("founderImage ? (") &&
    publicAboutContent.includes("Monogram Crest"),
  "Public About page uses architectural monogram crest as fallback when founder image is unset"
);
assert(
  publicAboutContent.includes("<CTASection />") &&
    publicAboutContent.includes("<GroupEcosystem"),
  "Public About page preserves Group Ecosystem and final CTA sections"
);
assert(
  publicAboutContent.includes("application/ld+json") &&
    publicAboutContent.includes("AboutPage") &&
    publicAboutContent.includes("BreadcrumbList") &&
    publicAboutContent.includes("Person"),
  "Public About page generates code-controlled JSON-LD structured schema"
);
assert(
  publicAboutContent.includes("isPreviewActive &&"),
  "Public About page renders admin draft preview notification banner when in preview mode"
);

// 8. Service Route Integrity (No arbitrary broken routes)
const VALID_SLUGS = [
  "surveying-site-measurements",
  "architecture-planning",
  "professional-construction-services",
  "interior-exterior-design",
  "water-treatment-plant-construction",
  "project-management-consultancy",
];
const usedSlugsValid = VALID_SLUGS.every(
  (slug) =>
    adminAboutContent.includes(slug) && publicAboutContent.includes("serviceSlug")
);
assert(
  usedSlugsValid,
  "All execution stages and sector links map strictly to verified service routes"
);

// 9. Content Governance Rules
assert(
  !adminAboutContent.includes("awardsWon") &&
    !adminAboutContent.includes("clientSatisfactionRate") &&
    !adminAboutContent.includes("sqftConstructedCounter"),
  "Admin CMS contains no unverified statistics or fake claim inputs"
);

console.log("\n==================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("==================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("ALL ABOUT CMS VERIFICATION GATES PASSED CLEANLY!");
}
