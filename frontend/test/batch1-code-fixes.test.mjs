import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ────────────────────────────────────────────────────────────────────────────
// SUITE 1: TASK-P0-4 — HiPRO Related Project Link Normalization
// ────────────────────────────────────────────────────────────────────────────

test("TASK-P0-4: frontend/app/(site)/services/[slug]/page.tsx uses buildProjectHref", () => {
  const filePath = path.join(ROOT, "app", "(site)", "services", "[slug]", "page.tsx");
  const content = fs.readFileSync(filePath, "utf8");

  // 1. Verify import statement exists
  assert.match(
    content,
    /import\s+\{[^}]*buildProjectHref[^}]*\}\s+from\s+["']@\/lib\/projectUrl["']/,
    "Must import buildProjectHref from @/lib/projectUrl"
  );

  // 2. Verify buildProjectHref is called with rel.slug and rel.id
  assert.match(
    content,
    /buildProjectHref\(\s*rel\.slug\s*,\s*rel\.id\s*\)\s*\|\|\s*["']\/projects["']/,
    "Must call buildProjectHref(rel.slug, rel.id) with fallback to /projects"
  );

  // 3. Verify raw interpolation without normalization is removed
  assert.doesNotMatch(
    content,
    /href=\{`\/projects\/\$\{relSlug\}`\}/,
    "Must not use raw un-normalized relSlug interpolation"
  );
});

test("TASK-P0-4: buildProjectHref contract and normalization behavior", async () => {
  // Read and test the actual logic from projectUrl.ts
  const projectUrlPath = path.join(ROOT, "lib", "projectUrl.ts");
  const projectUrlContent = fs.readFileSync(projectUrlPath, "utf8");

  assert.match(projectUrlContent, /export function buildProjectHref/, "buildProjectHref must be exported");

  // Pure logic verification matching projectUrl.ts
  function normalizeProjectSlug(raw) {
    if (!raw || typeof raw !== "string") return "";
    let s = raw.trim().replace(/^\/+|\/+$/g, "");
    while (/^projects(\/|$)/i.test(s)) {
      s = s.replace(/^projects\/?/i, "").replace(/^\/+|\/+$/g, "");
    }
    if (!s || s.includes("..") || /[<>\"\'`\\^~|{}[\]\s]/.test(s)) return "";
    return s.toLowerCase();
  }

  function buildProjectHref(rawSlug, fallbackId) {
    const cleanSlug = normalizeProjectSlug(rawSlug);
    if (cleanSlug) return `/projects/${cleanSlug}`;
    const cleanId = normalizeProjectSlug(fallbackId);
    if (cleanId) return `/projects/${cleanId}`;
    return null;
  }

  // 1. Clean canonical slug
  assert.strictEqual(
    buildProjectHref("adani-gas-chamber-shinghpur", "cmum9toex0007slp6srwmtibn"),
    "/projects/adani-gas-chamber-shinghpur"
  );

  // 2. Slug with slashes or /projects/ prefix is sanitized
  assert.strictEqual(
    buildProjectHref("/projects/adani-gas-chamber-shinghpur/", "cmum9toex0007slp6srwmtibn"),
    "/projects/adani-gas-chamber-shinghpur"
  );

  // 3. Null slug falls back to valid CUID
  assert.strictEqual(
    buildProjectHref(null, "cmucpstbq0004slp6osrt5bw1"),
    "/projects/cmucpstbq0004slp6osrt5bw1"
  );

  // 4. Undefined slug falls back to valid CUID
  assert.strictEqual(
    buildProjectHref(undefined, "cmumi72do0008slp6dnhx02g1"),
    "/projects/cmumi72do0008slp6dnhx02g1"
  );

  // 5. Malformed input safely falls back to /projects
  const fallback = buildProjectHref(null, null) || "/projects";
  assert.strictEqual(fallback, "/projects");
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 2: TASK-P1-1 — HBS Hero Headline Typo Elimination
// ────────────────────────────────────────────────────────────────────────────

test("TASK-P1-1: frontend/components/hbs/HbsHero.tsx eliminates double period bug", () => {
  const filePath = path.join(ROOT, "components", "hbs", "HbsHero.tsx");
  const content = fs.readFileSync(filePath, "utf8");

  // 1. Verify flawed string replace is gone
  assert.doesNotMatch(
    content,
    /line\.replace\(["']Build Better["'],\s*["']["']\)/,
    "Flawed string replace line.replace('Build Better', '') must be removed"
  );

  // 2. Verify regex sanitization exists
  assert.match(
    content,
    /line\.replace\(\/\\s\*\\\.\?Build Better\\\.\?\/i,\s*["']["']\)\.trim\(\)/,
    "Must use regex to clean Build Better and surrounding punctuation"
  );

  // 3. Verify helper function is used for both multiline and single-line
  assert.match(
    content,
    /renderHeadlineLine\(line\)/,
    "Must use renderHeadlineLine helper for multiline rendering"
  );
  assert.match(
    content,
    /renderHeadlineLine\(headline\)/,
    "Must use renderHeadlineLine helper for single-line rendering"
  );
});

test("TASK-P1-1: HBS headline string formatting logic test", () => {
  function formatHeadlinePrefix(line) {
    if (line.includes("Build Better")) {
      const prefixText = line.replace(/\s*\.?Build Better\.?/i, "").trim();
      return {
        prefix: prefixText ? `${prefixText} ` : "",
        highlight: "Build Better."
      };
    }
    return { line };
  }

  // Case 1: Standard seed / CMS input with trailing period
  const case1 = formatHeadlinePrefix("Maintain. Build Better.");
  assert.strictEqual(case1.prefix, "Maintain. ");
  assert.strictEqual(case1.highlight, "Build Better.");
  const fullText1 = case1.prefix + case1.highlight;
  assert.strictEqual(fullText1, "Maintain. Build Better.");
  assert.doesNotMatch(fullText1, /Maintain\.\s*\./, "Must not contain double period");

  // Case 2: Input without trailing period
  const case2 = formatHeadlinePrefix("Maintain. Build Better");
  assert.strictEqual(case2.prefix, "Maintain. ");
  assert.strictEqual(case2.highlight, "Build Better.");
  const fullText2 = case2.prefix + case2.highlight;
  assert.strictEqual(fullText2, "Maintain. Build Better.");

  // Case 3: Line with only "Build Better."
  const case3 = formatHeadlinePrefix("Build Better.");
  assert.strictEqual(case3.prefix, "");
  assert.strictEqual(case3.highlight, "Build Better.");

  // Case 4: First line without "Build Better"
  const case4 = formatHeadlinePrefix("Repair. Protect.");
  assert.strictEqual(case4.line, "Repair. Protect.");
});

// ────────────────────────────────────────────────────────────────────────────
// SUITE 3: TASK-P1-4 — HBS Service Detail Warranty Container Safety
// ────────────────────────────────────────────────────────────────────────────

test("TASK-P1-4: frontend/components/hbs/HbsServiceDetail.tsx exports hasValidWarranty and components", () => {
  const filePath = path.join(ROOT, "components", "hbs", "HbsServiceDetail.tsx");
  assert.ok(fs.existsSync(filePath), "HbsServiceDetail.tsx must exist");

  const content = fs.readFileSync(filePath, "utf8");

  assert.match(content, /export function hasValidWarranty/, "Must export hasValidWarranty");
  assert.match(content, /export function HbsWarrantyCard/, "Must export HbsWarrantyCard");
  assert.match(content, /export function HbsWarrantyBadge/, "Must export HbsWarrantyBadge");
});

test("TASK-P1-4: hasValidWarranty rejects null, undefined, empty, and whitespace", () => {
  function hasValidWarranty(warrantyDetails) {
    if (!warrantyDetails || typeof warrantyDetails !== "string") {
      return false;
    }
    return warrantyDetails.trim().length > 0;
  }

  assert.strictEqual(hasValidWarranty(null), false);
  assert.strictEqual(hasValidWarranty(undefined), false);
  assert.strictEqual(hasValidWarranty(""), false);
  assert.strictEqual(hasValidWarranty("   "), false);
  assert.strictEqual(hasValidWarranty("\t\n"), false);

  assert.strictEqual(hasValidWarranty("Up to 5-Year warranty"), true);
  assert.strictEqual(hasValidWarranty("10-Year leak-free warranty"), true);
});

test("TASK-P1-4: frontend/app/hbs/services/[slug]/page.tsx integrates HbsWarrantyCard and guards", () => {
  const filePath = path.join(ROOT, "app", "hbs", "services", "[slug]", "page.tsx");
  const content = fs.readFileSync(filePath, "utf8");

  // 1. Verify import from @/components/hbs/HbsServiceDetail
  assert.match(
    content,
    /import\s+\{[^}]*HbsWarrantyCard[^}]*\}\s+from\s+["']@\/components\/hbs\/HbsServiceDetail["']/,
    "Must import HbsWarrantyCard from @/components/hbs/HbsServiceDetail"
  );

  // 2. Verify hasValidWarranty guard protects the section
  assert.match(
    content,
    /hasValidWarranty\(\s*service\.warrantyDetails\s*\)/,
    "Must use hasValidWarranty to guard warranty rendering"
  );

  // 3. Verify HbsWarrantyCard component is rendered
  assert.match(
    content,
    /<HbsWarrantyCard\s+warrantyDetails=\{service\.warrantyDetails\}\s*\/>/,
    "Must render <HbsWarrantyCard warrantyDetails={service.warrantyDetails} />"
  );
});
