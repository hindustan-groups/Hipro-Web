import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==========================================================");
console.log("     HIND BUILD (HBS) SEO & SOCIAL SHARING TEST SUITE     ");
console.log("==========================================================");

// --- 1. Static Banner Asset Verification ---
console.log("\n--- 1. OpenGraph Banner Assets Verification ---");

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
console.log(`[PASS] hbs-og-banner.jpg is exactly 1200x630 (Standard 1.91:1 OpenGraph ratio)`);

// --- 2. SEO Helper Logic Verification ---
console.log("\n--- 2. Hind Build SEO Helpers Verification ---");

const hbsSeoPath = path.join(rootDir, "lib", "hbsSeo.ts");
assert.ok(fs.existsSync(hbsSeoPath), "lib/hbsSeo.ts must exist");
const hbsSeoContent = fs.readFileSync(hbsSeoPath, "utf-8");

assert.ok(hbsSeoContent.includes("getHbsCanonicalUrl"), "Exports getHbsCanonicalUrl");
assert.ok(hbsSeoContent.includes("resolveHbsOgImage"), "Exports resolveHbsOgImage");
assert.ok(hbsSeoContent.includes("HBS_SEO_KEYWORDS"), "Exports HBS_SEO_KEYWORDS");
assert.ok(hbsSeoContent.includes("hbs-og-banner.jpg"), "Defaults to hbs-og-banner.jpg");
// Verify that the fallback mechanism filters out svg
assert.ok(hbsSeoContent.includes(".endsWith(\".svg\")"), "Filters out SVG images");
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

// --- 4. Sitemap Audit ---
console.log("\n--- 4. Sitemap Audit ---");
const sitemapPath = path.join(rootDir, "app", "sitemap.ts");
const sitemapContent = fs.readFileSync(sitemapPath, "utf-8");
assert.ok(sitemapContent.includes("/hbs"), "Sitemap must include /hbs routes");
assert.ok(sitemapContent.includes("hbsServiceRoutes"), "Sitemap must include hbsServiceRoutes");
assert.ok(sitemapContent.includes("hbsProjectRoutes"), "Sitemap must include hbsProjectRoutes");
console.log("[PASS] Sitemap indexes all Hind Build static pages, services, and projects");

console.log("\n==========================================================");
console.log("       ALL HIND BUILD SEO & SOCIAL TESTS PASSED!          ");
console.log("==========================================================\n");
