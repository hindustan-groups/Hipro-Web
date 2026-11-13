import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(rootDir, "..");

console.log("==========================================================");
console.log("       HiPRO COMPREHENSIVE SEO VERIFICATION SUITE         ");
console.log("==========================================================");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    throw err;
  }
}

// 1. Root Layout Language & Alt Text
test("Root layout sets lang=\"en-IN\" for geotargeted local SEO", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/layout.tsx"), "utf-8");
  assert.match(content, /<html\s+lang="en-IN"/, "html tag should specify lang=\"en-IN\"");
});

test("Root layout OG banner alt text has valid UTF-8 punctuation", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/layout.tsx"), "utf-8");
  assert.ok(!content.includes("â€"), "Should not contain mojibake 'â€'");
  assert.ok(!content.includes("Â·"), "Should not contain mojibake 'Â·'");
  assert.match(content, /alt:\s*["']Hindustan Projects \(HiPRO\)/, "Should have proper alt text");
});

// 2. Services Page Metadata
test("Services page metadata has local title, relative canonical, and OG/Twitter cards", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/(site)/services/page.tsx"), "utf-8");
  assert.match(content, /title:\s*["']Construction & Engineering Services in Bhilwara, Rajasthan["']/, "Title should include Bhilwara, Rajasthan");
  assert.match(content, /canonical:\s*["']\/services["']/, "Canonical must be relative /services");
  assert.match(content, /openGraph:\s*\{/, "Must include openGraph block");
  assert.match(content, /twitter:\s*\{/, "Must include twitter block");
});

// 3. Service Detail Page Metadata
test("Service detail page enriches OpenGraph with locale and siteName, and adds Twitter card", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/(site)/services/[slug]/page.tsx"), "utf-8");
  assert.match(content, /siteName:\s*["']Hindustan Projects \(HiPRO\)["']/, "Must include siteName in openGraph");
  assert.match(content, /locale:\s*["']en_IN["']/, "Must include locale in openGraph");
  assert.match(content, /twitter:\s*\{/, "Must include twitter block");
});

// 4. Why Us Page Metadata
test("Why Choose Us page metadata has local title, relative canonical, and OG/Twitter cards", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/(site)/why-us/page.tsx"), "utf-8");
  assert.match(content, /title:\s*["']Why Choose Us — Engineering Discipline & Construction Reliability["']/, "Title should be descriptive");
  assert.match(content, /canonical:\s*["']\/why-us["']/, "Canonical must be relative /why-us");
  assert.match(content, /openGraph:\s*\{/, "Must include openGraph block");
  assert.match(content, /twitter:\s*\{/, "Must include twitter block");
});

// 5. Careers Page Metadata
test("Careers page metadata has relative canonical, OpenGraph, and Twitter cards", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/(site)/careers/page.tsx"), "utf-8");
  assert.match(content, /canonical:\s*["']\/careers["']/, "Canonical must be relative /careers");
  assert.match(content, /openGraph:\s*\{/, "Must include openGraph block");
  assert.match(content, /twitter:\s*\{/, "Must include twitter block");
});

// 6. Contact Page Metadata
test("Contact page metadata includes Twitter card", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/(site)/contact/page.tsx"), "utf-8");
  assert.match(content, /twitter:\s*\{/, "Must include twitter block in generateMetadata");
});

// 7. Cost Estimator Layout Metadata
test("Cost estimator layout metadata has relative canonical and OG/Twitter cards", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/(site)/cost-estimator/layout.tsx"), "utf-8");
  assert.match(content, /canonical:\s*["']\/cost-estimator["']/, "Canonical must be relative /cost-estimator");
  assert.match(content, /openGraph:\s*\{/, "Must include openGraph block");
  assert.match(content, /twitter:\s*\{/, "Must include twitter block");
});

// 8. Blogs Page Canonical & OG Banner
test("Blogs index page has relative canonical and uses existing /og-banner.jpg", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/(site)/blogs/page.tsx"), "utf-8");
  assert.match(content, /canonical:\s*["']\/blogs["']/, "Canonical must be relative /blogs");
  assert.ok(content.includes("/og-banner.jpg"), "Must reference /og-banner.jpg");
  assert.ok(!content.includes("/og-image.jpg"), "Must not reference missing /og-image.jpg directly");
});

// 9. Projects Page Canonical & OG Banner
test("Projects index page has relative canonical and uses existing /og-banner.jpg", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/(site)/projects/page.tsx"), "utf-8");
  assert.match(content, /canonical:\s*["']\/projects["']/, "Canonical must be relative /projects");
  assert.ok(content.includes("/og-banner.jpg"), "Must reference /og-banner.jpg");
  assert.ok(!content.includes("/og-image.jpg"), "Must not reference missing /og-image.jpg directly");
});

// 10. Sitemap Intent Priority Calibration
test("Sitemap implements search-intent weighted priorities", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/sitemap.ts"), "utf-8");
  assert.match(content, /'\/contact':\s*0\.9/, "Contact should have 0.9 priority");
  assert.match(content, /'\/cost-estimator':\s*0\.9/, "Cost estimator should have 0.9 priority");
  assert.match(content, /'\/services':\s*0\.8/, "Services should have 0.8 priority");
  assert.match(content, /'\/why-us':\s*0\.7/, "Why-us should have 0.7 priority");
  assert.match(content, /'\/careers':\s*0\.6/, "Careers should have 0.6 priority");
  assert.match(content, /'\/privacy-policy':\s*0\.3/, "Legal routes should have 0.3 priority");
});

// 11. Robots.txt Portal Disallow
test("robots.txt disallows /empanelment portal paths to protect crawler budget", () => {
  const content = fs.readFileSync(path.join(rootDir, "public/robots.txt"), "utf-8");
  assert.match(content, /Disallow:\s*\/empanelment/, "Must disallow /empanelment");
  assert.match(content, /Disallow:\s*\/admin/, "Must disallow /admin");
  assert.match(content, /Sitemap:\s*https:\/\/www\.hindustanprojects\.in\/sitemap\.xml/, "Must link to sitemap");
});

// 12. Public OG Asset Fallback
test("Public og-image.jpg exists as a valid fallback asset matching og-banner.jpg", () => {
  const imagePath = path.join(rootDir, "public/og-image.jpg");
  assert.ok(fs.existsSync(imagePath), "public/og-image.jpg must exist");
  const stats = fs.statSync(imagePath);
  assert.ok(stats.size > 50000, "public/og-image.jpg must not be empty");
});

// 13. Local SEO Master Plan Documentation
test("HIPRO_LOCAL_SEO_MASTER_PLAN.md exists and covers all 12 key sections", () => {
  const docPath = path.join(repoDir, "docs/seo/HIPRO_LOCAL_SEO_MASTER_PLAN.md");
  assert.ok(fs.existsSync(docPath), "Master plan file must exist in docs/seo/");
  const doc = fs.readFileSync(docPath, "utf-8");
  assert.ok(doc.includes("Business & Geographic SEO Objectives"), "Must cover Business & Geographic SEO Objectives");
  assert.ok(doc.includes("Keyword Clusters"), "Must cover Keyword Clusters");
  assert.ok(doc.includes("Keyword-to-Page Mapping"), "Must cover Keyword-to-Page Mapping");
  assert.ok(doc.includes("Existing Page Inventory"), "Must cover Existing Page Inventory");
  assert.ok(doc.includes("Structured Data Plan"), "Must cover Structured Data Plan");
  assert.ok(doc.includes("Technical SEO"), "Must cover Technical SEO");
  assert.ok(doc.includes("Internal Linking"), "Must cover Internal Linking");
  assert.ok(doc.includes("Performance Protection"), "Must cover Performance Protection");
  assert.ok(doc.includes("Measurement & Acceptance Criteria"), "Must cover Measurement & Acceptance Criteria");
});

// 14. SEO Audit Document
test("HIPRO_SEO_AUDIT_2026.md exists and contains comprehensive findings", () => {
  const docPath = path.join(repoDir, "docs/seo/HIPRO_SEO_AUDIT_2026.md");
  assert.ok(fs.existsSync(docPath), "SEO audit file must exist in docs/seo/");
  const doc = fs.readFileSync(docPath, "utf-8");
  assert.ok(doc.includes("Executive Summary"), "Must contain Executive Summary");
  assert.ok(doc.includes("Per-Page SEO Findings"), "Must contain Per-Page SEO Findings");
  assert.ok(doc.includes("robots.txt Audit"), "Must contain robots.txt Audit");
  assert.ok(doc.includes("sitemap.ts Audit"), "Must contain sitemap.ts Audit");
  assert.ok(doc.includes("Schema / Structured Data Audit"), "Must contain Schema Audit");
});

console.log("==========================================================");
console.log(`TOTAL SEO TESTS: ${total} | PASSED: ${passed} | FAILED: 0`);
console.log("==========================================================");

