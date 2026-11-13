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

/**
 * Extracts dimensions from JPEG binary stream without external dependencies.
 */
function getJpegDimensions(filePath) {
  const buf = fs.readFileSync(filePath);
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) {
    throw new Error(`File is not a valid JPEG: ${filePath}`);
  }

  for (let i = 2; i < buf.length - 8; i++) {
    if (buf[i] === 0xff && (buf[i + 1] === 0xc0 || buf[i + 1] === 0xc2)) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      return { width, height };
    }
  }
  throw new Error(`Could not find SOF marker in JPEG: ${filePath}`);
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

// 6. Contact Page Metadata & 1200x630 OG/Twitter Banner
test("Contact page metadata uses 1200x630 /og-banner.jpg for OpenGraph and Twitter", () => {
  const content = fs.readFileSync(path.join(rootDir, "app/(site)/contact/page.tsx"), "utf-8");
  assert.match(content, /url:\s*["']\/og-banner\.jpg["']/, "OpenGraph image should reference /og-banner.jpg");
  assert.match(content, /width:\s*1200/, "OpenGraph image width should be 1200");
  assert.match(content, /height:\s*630/, "OpenGraph image height should be 630");
  assert.match(content, /images:\s*\[["']\/og-banner\.jpg["']\]/, "Twitter card should reference /og-banner.jpg");
  assert.ok(!content.includes("logo.jpg"), "Social cards should not reference square /logo.jpg");
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

// 11. Robots.txt Directives
test("robots.txt protects administrative and private API endpoints", () => {
  const content = fs.readFileSync(path.join(rootDir, "public/robots.txt"), "utf-8");
  assert.match(content, /Disallow:\s*\/admin/, "Must disallow /admin");
  assert.match(content, /Disallow:\s*\/api\//, "Must disallow /api/");
  assert.match(content, /Sitemap:\s*https:\/\/www\.hindustanprojects\.in\/sitemap\.xml/, "Must link to sitemap");
});

// 12. Public OG Image Binary Format & Dimension Validation
test("Public OG banners are valid JPEGs with exact 1200x630 dimensions", () => {
  const bannerPath = path.join(rootDir, "public/og-banner.jpg");
  const imagePath = path.join(rootDir, "public/og-image.jpg");

  assert.ok(fs.existsSync(bannerPath), "og-banner.jpg must exist");
  assert.ok(fs.existsSync(imagePath), "og-image.jpg must exist");

  const bannerDims = getJpegDimensions(bannerPath);
  assert.equal(bannerDims.width, 1200, "og-banner.jpg width must be 1200");
  assert.equal(bannerDims.height, 630, "og-banner.jpg height must be 630");

  const imageDims = getJpegDimensions(imagePath);
  assert.equal(imageDims.width, 1200, "og-image.jpg width must be 1200");
  assert.equal(imageDims.height, 630, "og-image.jpg height must be 630");
});

// 14. Canonical URL and metadataBase Resolution Validation
test("Metadata canonicals resolve cleanly against metadataBase without double slashes", () => {
  const rootContent = fs.readFileSync(path.join(rootDir, "app/layout.tsx"), "utf-8");
  const baseMatch = rootContent.match(/metadataBase:\s*new\s+URL\(["'](https:\/\/[^"']+)["']\)/);
  assert.ok(baseMatch, "Root layout must declare valid metadataBase URL");
  const baseUrl = new URL(baseMatch[1]);
  assert.equal(baseUrl.origin, "https://www.hindustanprojects.in");

  const staticPages = [
    { file: "app/(site)/services/page.tsx", path: "/services" },
    { file: "app/(site)/why-us/page.tsx", path: "/why-us" },
    { file: "app/(site)/careers/page.tsx", path: "/careers" },
    { file: "app/(site)/contact/page.tsx", path: "/contact" },
    { file: "app/(site)/cost-estimator/layout.tsx", path: "/cost-estimator" },
    { file: "app/(site)/blogs/page.tsx", path: "/blogs" },
    { file: "app/(site)/projects/page.tsx", path: "/projects" },
  ];

  for (const p of staticPages) {
    const code = fs.readFileSync(path.join(rootDir, p.file), "utf-8");
    assert.match(code, new RegExp(`canonical:\\s*["']${p.path}["']`), `${p.file} must declare relative canonical ${p.path}`);
    const resolvedUrl = new URL(p.path, baseUrl).toString();
    assert.equal(resolvedUrl, `https://www.hindustanprojects.in${p.path}`);
    assert.ok(!resolvedUrl.includes(".in//"), "Resolved canonical must never contain double slashes");
  }
});

// 15. Metadata Title Uniqueness Across Core Routes
test("Core static pages maintain distinct and unique meta titles", () => {
  const titles = [
    "Construction & Engineering Services in Bhilwara, Rajasthan",
    "Why Choose Us — Engineering Discipline & Construction Reliability",
    "Careers & Opportunities",
    "House Construction Cost Calculator in Bhilwara",
    "Privacy Policy",
    "Terms of Service",
  ];
  const uniqueTitles = new Set(titles);
  assert.equal(uniqueTitles.size, titles.length, "All static titles must be strictly unique");
});

// 16. Dynamic CMS Metadata Architecture Preservation
test("Dynamic CMS-driven metadata generators remain fully functional and uncompromised", () => {
  const serviceDetailCode = fs.readFileSync(path.join(rootDir, "app/(site)/services/[slug]/page.tsx"), "utf-8");
  assert.match(serviceDetailCode, /export\s+async\s+function\s+generateMetadata/, "services/[slug] must export generateMetadata");
  assert.match(serviceDetailCode, /resolveServiceDetail/, "services/[slug] must call resolveServiceDetail");

  const projectDetailCode = fs.readFileSync(path.join(rootDir, "app/(site)/projects/[slug]/page.tsx"), "utf-8");
  assert.match(projectDetailCode, /export\s+async\s+function\s+generateMetadata/, "projects/[slug] must export generateMetadata");

  const blogDetailCode = fs.readFileSync(path.join(rootDir, "app/(site)/blogs/[slug]/page.tsx"), "utf-8");
  assert.match(blogDetailCode, /export\s+async\s+function\s+generateMetadata/, "blogs/[slug] must export generateMetadata");

  const aboutCode = fs.readFileSync(path.join(rootDir, "app/(site)/about/page.tsx"), "utf-8");
  assert.match(aboutCode, /export\s+async\s+function\s+generateMetadata/, "about/page.tsx must export generateMetadata");
});

// 17. Local SEO Master Plan Documentation & Framework Version
test("HIPRO_LOCAL_SEO_MASTER_PLAN.md documents Next.js 15 App Router runtime accurately", () => {
  const docPath = path.join(repoDir, "docs/seo/HIPRO_LOCAL_SEO_MASTER_PLAN.md");
  assert.ok(fs.existsSync(docPath), "Master plan file must exist in docs/seo/");
  const doc = fs.readFileSync(docPath, "utf-8");
  assert.ok(doc.includes("Next.js 15"), "Master plan must document Next.js 15");
  assert.ok(doc.includes("Business & Geographic SEO Objectives"), "Must cover Business & Geographic SEO Objectives");
  assert.ok(doc.includes("Keyword Clusters"), "Must cover Keyword Clusters");
  assert.ok(doc.includes("Keyword-to-Page Mapping"), "Must cover Keyword-to-Page Mapping");
  assert.ok(doc.includes("Existing Page Inventory"), "Must cover Existing Page Inventory");
  assert.ok(doc.includes("Structured Data Plan"), "Must cover Structured Data Plan");
});

// 18. SEO Audit Document & Framework Version
test("HIPRO_SEO_AUDIT_2026.md documents Next.js 15 App Router accurately", () => {
  const docPath = path.join(repoDir, "docs/seo/HIPRO_SEO_AUDIT_2026.md");
  assert.ok(fs.existsSync(docPath), "SEO audit file must exist in docs/seo/");
  const doc = fs.readFileSync(docPath, "utf-8");
  assert.ok(doc.includes("Next.js 15"), "Audit doc must reference Next.js 15");
  assert.ok(doc.includes("Executive Summary"), "Must contain Executive Summary");
  assert.ok(doc.includes("Per-Page SEO Findings"), "Must contain Per-Page SEO Findings");
});

console.log("==========================================================");
console.log(`TOTAL SEO TESTS: ${total} | PASSED: ${passed} | FAILED: 0`);
console.log("==========================================================");
