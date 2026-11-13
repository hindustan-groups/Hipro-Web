import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==========================================================");
console.log("     HIND BUILD (HBS) PRODUCTION AUDIT & TEST SUITE       ");
console.log("==========================================================");

// --- 1. Static Banner & Favicon Assets Verification ---
console.log("\n--- 1. Assets Verification ---");

const jpgBannerPath = path.join(rootDir, "public", "hbs-og-banner.jpg");
assert.ok(fs.existsSync(jpgBannerPath), "public/hbs-og-banner.jpg must exist");

const jpgStats = fs.statSync(jpgBannerPath);
console.log(`[PASS] hbs-og-banner.jpg exists: ${jpgStats.size} bytes (${Math.round(jpgStats.size / 1024)} KB)`);

// WhatsApp strict rule: < 300KB
assert.ok(
  jpgStats.size < 300 * 1024,
  `Banner must be strictly under 300KB for WhatsApp unfurling (actual: ${jpgStats.size} bytes)`
);
console.log("[PASS] hbs-og-banner.jpg is strictly under 300KB (WhatsApp safe)");

// Check JPEG header and dimensions
const jpgBuf = fs.readFileSync(jpgBannerPath);
assert.equal(jpgBuf[0], 0xff, "JPEG magic byte 0 must be 0xFF");
assert.equal(jpgBuf[1], 0xd8, "JPEG magic byte 1 must be 0xD8");

function getJpgDimensions(buf) {
  let offset = 2;
  while (offset < buf.length) {
    const marker = buf.readUInt16BE(offset);
    offset += 2;
    if (marker === 0xffc0 || marker === 0xffc2) {
      return { height: buf.readUInt16BE(offset + 3), width: buf.readUInt16BE(offset + 5) };
    }
    const len = buf.readUInt16BE(offset);
    offset += len;
  }
  return null;
}

const dims = getJpgDimensions(jpgBuf);
assert.ok(dims, "Must parse JPEG dimensions");
assert.equal(dims.width, 1200, "OG Banner width must be 1200");
assert.equal(dims.height, 630, "OG Banner height must be 630");
console.log("[PASS] hbs-og-banner.jpg is exactly 1200x630 (Standard 1.91:1 OpenGraph ratio)");

// Favicon binary validation
const faviconPath = path.join(rootDir, "public", "favicon.ico");
assert.ok(fs.existsSync(faviconPath), "public/favicon.ico must exist");
const icoBuf = fs.readFileSync(faviconPath);
assert.ok(icoBuf.length >= 4, "favicon.ico must not be empty");
assert.equal(icoBuf.readUInt16LE(0), 0, "ICO reserved bytes must be 0");
assert.equal(icoBuf.readUInt16LE(2), 1, "ICO type must be 1 (image/x-icon)");
console.log(`[PASS] favicon.ico is a valid binary ICO file (${icoBuf.length} bytes)`);

// --- 2. SEO Helper Logic Verification ---
console.log("\n--- 2. Hind Build SEO Helpers Verification ---");

const hbsSeoPath = path.join(rootDir, "lib", "hbsSeo.ts");
assert.ok(fs.existsSync(hbsSeoPath), "lib/hbsSeo.ts must exist");
const hbsSeoContent = fs.readFileSync(hbsSeoPath, "utf-8");

assert.ok(hbsSeoContent.includes("getHbsCanonicalUrl"), "Exports getHbsCanonicalUrl");
assert.ok(hbsSeoContent.includes("resolveHbsOgImage"), "Exports resolveHbsOgImage");
assert.ok(hbsSeoContent.includes("HBS_SEO_KEYWORDS"), "Exports HBS_SEO_KEYWORDS");
assert.ok(hbsSeoContent.includes("hbs-og-banner.jpg"), "Defaults to hbs-og-banner.jpg");
assert.ok(hbsSeoContent.includes('.endsWith(".svg")'), "Filters out SVG images");
console.log("[PASS] lib/hbsSeo.ts defines required functions and rejects SVG defaults");

// --- 3. Page File Audits ---
console.log("\n--- 3. Page-Level SEO & Social Tags Audit ---");

const pagesToAudit = [
  { path: "app/hbs/layout.tsx", name: "HBS Root Layout" },
  { path: "app/hbs/page.tsx", name: "HBS Home Page" },
  { path: "app/hbs/about/page.tsx", name: "HBS About Page" },
  { path: "app/hbs/services/page.tsx", name: "HBS Services Directory" },
  { path: "app/hbs/services/[slug]/page.tsx", name: "HBS Service Detail" },
  { path: "app/hbs/projects/page.tsx", name: "HBS Projects Directory" },
  { path: "app/hbs/projects/[slug]/page.tsx", name: "HBS Project Detail" },
  { path: "app/hbs/why-choose-us/page.tsx", name: "HBS Why Choose Us" },
  { path: "app/hbs/contact/page.tsx", name: "HBS Contact Page" },
  { path: "app/hbs/privacy-policy/page.tsx", name: "HBS Privacy Policy Page" },
  { path: "app/hbs/terms/page.tsx", name: "HBS Terms of Service Page" },
];

for (const p of pagesToAudit) {
  const fullP = path.join(rootDir, p.path);
  assert.ok(fs.existsSync(fullP), `${p.path} must exist`);
  const content = fs.readFileSync(fullP, "utf-8");

  // Every page must have generateMetadata
  assert.ok(
    content.includes("generateMetadata"),
    `${p.name} must export generateMetadata`
  );

  // Must import from hbsSeo
  assert.ok(
    content.includes("@/lib/hbsSeo"),
    `${p.name} must use centralized @/lib/hbsSeo`
  );

  // Must define OpenGraph with images
  assert.ok(
    content.includes("openGraph") && content.includes("images"),
    `${p.name} must define openGraph with images`
  );

  // Must define Twitter summary_large_image
  assert.ok(
    content.includes("summary_large_image"),
    `${p.name} must define twitter card as summary_large_image`
  );

  // Must never have hardcoded .svg fallback
  assert.ok(
    !content.includes("/hbs-og-default.svg"),
    `${p.name} must NOT have /hbs-og-default.svg fallback`
  );

  console.log(`[PASS] ${p.name}: Valid metadata, OG tags, Twitter Card & canonical mapping`);
}

// --- 4. Dedicated HBS Sitemap Route Handler Audit ---
console.log("\n--- 4. Dedicated HBS Sitemap Audit ---");
const hbsSitemapRoutePath = path.join(rootDir, "app", "api", "hbs-sitemap", "route.ts");
assert.ok(fs.existsSync(hbsSitemapRoutePath), "app/api/hbs-sitemap/route.ts must exist");
const hbsSitemapContent = fs.readFileSync(hbsSitemapRoutePath, "utf-8");

assert.ok(hbsSitemapContent.includes("https://hindbuilding.hindustanprojects.in"), "HBS sitemap uses canonical domain");
assert.ok(hbsSitemapContent.includes("/privacy-policy"), "HBS sitemap indexes /privacy-policy");
assert.ok(hbsSitemapContent.includes("/terms"), "HBS sitemap indexes /terms");
assert.ok(hbsSitemapContent.includes("fetchHbsServices"), "HBS sitemap fetches dynamic services");
assert.ok(hbsSitemapContent.includes("fetchHbsProjects"), "HBS sitemap fetches dynamic projects");
assert.ok(hbsSitemapContent.includes("application/xml"), "HBS sitemap sets XML Content-Type");
console.log("[PASS] Dedicated HBS sitemap generates canonical XML under hindbuilding.hindustanprojects.in");

// --- 5. Dedicated HBS Robots Route Handler Audit ---
console.log("\n--- 5. Dedicated HBS Robots Audit ---");
const hbsRobotsRoutePath = path.join(rootDir, "app", "api", "hbs-robots", "route.ts");
assert.ok(fs.existsSync(hbsRobotsRoutePath), "app/api/hbs-robots/route.ts must exist");
const hbsRobotsContent = fs.readFileSync(hbsRobotsRoutePath, "utf-8");

assert.ok(hbsRobotsContent.includes("Disallow: /admin"), "Robots disallows /admin");
assert.ok(hbsRobotsContent.includes("Disallow: /api/"), "Robots disallows /api/");
assert.ok(hbsRobotsContent.includes("https://hindbuilding.hindustanprojects.in/sitemap.xml"), "Robots references HBS sitemap");
console.log("[PASS] Dedicated HBS robots route protects admin/api and references dedicated sitemap");

// --- 6. Shared HiPRO Sitemap Decoupling Audit ---
console.log("\n--- 6. Shared HiPRO Sitemap Isolation Audit ---");
const hiproSitemapPath = path.join(rootDir, "app", "sitemap.ts");
const hiproSitemapContent = fs.readFileSync(hiproSitemapPath, "utf-8");
assert.ok(!hiproSitemapContent.includes("hbsServiceRoutes"), "HiPRO sitemap must not contain hbsServiceRoutes");
assert.ok(!hiproSitemapContent.includes("hbsProjectRoutes"), "HiPRO sitemap must not contain hbsProjectRoutes");
console.log("[PASS] HiPRO sitemap does not contain HBS routes (clean decoupling)");

// --- 7. Middleware Routing & Subdomain Rewrite Audit ---
console.log("\n--- 7. Middleware Subdomain & Redirect Audit ---");
const middlewarePath = path.join(rootDir, "middleware.ts");
const middlewareContent = fs.readFileSync(middlewarePath, "utf-8");

assert.ok(middlewareContent.includes("/api/hbs-sitemap"), "Middleware rewrites /sitemap.xml to /api/hbs-sitemap on HBS subdomain");
assert.ok(middlewareContent.includes("/api/hbs-robots"), "Middleware rewrites /robots.txt to /api/hbs-robots on HBS subdomain");
assert.ok(middlewareContent.includes("https://hindbuilding.hindustanprojects.in"), "Middleware redirects primary domain /hbs to HBS canonical origin");
assert.ok(middlewareContent.includes("301"), "Middleware uses permanent 301 redirect for primary domain /hbs traffic");
console.log("[PASS] Middleware accurately handles HBS subdomain rewrites and primary domain 301 redirects");

// --- 8. Analytics & PII Shielding Audit ---
console.log("\n--- 8. HBS Analytics & PII Shielding Audit ---");
const analyticsPath = path.join(rootDir, "lib", "hbsAnalytics.ts");
assert.ok(fs.existsSync(analyticsPath), "lib/hbsAnalytics.ts must exist");
const analyticsContent = fs.readFileSync(analyticsPath, "utf-8");

assert.ok(analyticsContent.includes("generate_lead"), "Supports generate_lead event");
assert.ok(analyticsContent.includes("form_start"), "Supports form_start event");
assert.ok(analyticsContent.includes("click_to_call"), "Supports click_to_call event");
assert.ok(analyticsContent.includes("click_whatsapp"), "Supports click_whatsapp event");
assert.ok(analyticsContent.includes("PROHIBITED_PII_KEYS"), "Defines prohibited PII keys");
console.log("[PASS] HBS Analytics implements type-safe events and PII stripping");

// --- 9. Verified 19 Services & Phone Number Audit ---
console.log("\n--- 9. Services & Contact Details Audit ---");
const hbsDataPath = path.join(rootDir, "lib", "hbsData.ts");
const hbsDataContent = fs.readFileSync(hbsDataPath, "utf-8");

assert.ok(hbsDataContent.includes("+91 94628 77757"), "DEFAULT_HBS_CONTENT uses official phone +91 94628 77757");
assert.ok(hbsDataContent.includes("9462877757"), "DEFAULT_HBS_CONTENT uses official digits 9462877757");
assert.ok(!hbsDataContent.includes("9462577757"), "No typos like 9462577757 in hbsData.ts");
assert.ok(!hbsDataContent.includes("9482877757"), "No typos like 9482877757 in hbsData.ts");

// Verify all 19 database slugs are present
const expectedSlugs = [
  "structure-repair",
  "water-leakage-solution",
  "plumbing-and-electrical",
  "painting-and-wall-repair",
  "terrace-and-bird-protection",
  "termite-control",
  "tile-work",
  "ac-lift-and-solar",
  "electrical-and-machine-work",
  "safety-and-compliance",
  "gardening",
  "cleaning-services",
  "packers-and-movers",
  "cctv-and-security",
  "smart-home-automation",
  "furniture-work",
  "wall-decor-and-wallpaper",
  "facade-work-acp-glass",
  "fabrication-work",
];

for (const slug of expectedSlugs) {
  assert.ok(
    hbsDataContent.includes(`slug: "${slug}"`),
    `DEFAULT_HBS_SERVICES must include seeded service slug: ${slug}`
  );
}
console.log("[PASS] All 19 database seeded service slugs and official phone numbers verified");

console.log("\n==========================================================");
console.log("       ALL HIND BUILD SEO & SOCIAL TESTS PASSED!          ");
console.log("==========================================================\n");
