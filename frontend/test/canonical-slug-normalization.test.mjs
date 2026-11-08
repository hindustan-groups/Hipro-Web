/**
 * HiPRO Canonical Project Slug Normalization Verification Suite (TASK-P0-1B)
 *
 * Verifies that project slug normalization for canonical URL construction:
 * 1. Preserves clean slugs
 * 2. Strips single or multiple leading slashes
 * 3. Strips 'projects/' prefix
 * 4. Strips duplicated 'projects/' or '/projects/' prefixes
 * 5. Prevents double-slashes in generated canonical URLs
 */

import assert from "node:assert";

console.log("==================================================================");
console.log("     HiPRO TASK-P0-1B: CANONICAL SLUG NORMALIZATION TEST SUITE    ");
console.log("==================================================================\n");

// Implementation under test matching frontend/app/(site)/projects/[slug]/page.tsx
function normalizeProjectSlug(raw) {
  if (!raw || typeof raw !== "string") return "";
  let s = raw.trim();
  // Strip leading and trailing slashes repeatedly
  s = s.replace(/^\/+|\/+$/g, "");
  // Repeatedly strip any leading "projects/" or "projects" prefix
  while (/^projects(\/|$)/i.test(s)) {
    s = s.replace(/^projects\/?/i, "").replace(/^\/+|\/+$/g, "");
  }
  return s;
}

function buildCanonicalUrl(rawSlug) {
  const baseUrl = "https://www.hindustanprojects.in";
  const cleanSlug = normalizeProjectSlug(rawSlug);
  return `${baseUrl}/projects/${cleanSlug}`;
}

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`[PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${desc}`);
    console.error(`       Error: ${err.message}`);
    failed++;
  }
}

// 1. Clean slug
it("Case 1: Clean slug output matches expected and preserves valid canonical URL", () => {
  const input = "adani-gas-chamber-shinghpur";
  const normalized = normalizeProjectSlug(input);
  const canonical = buildCanonicalUrl(input);

  assert.strictEqual(normalized, "adani-gas-chamber-shinghpur");
  assert.strictEqual(canonical, "https://www.hindustanprojects.in/projects/adani-gas-chamber-shinghpur");
});

// 2. Leading slash
it("Case 2: Leading slash is stripped; prevents double-slash in canonical URL", () => {
  const input = "/adani-gas-chamber-shinghpur";
  const normalized = normalizeProjectSlug(input);
  const canonical = buildCanonicalUrl(input);

  assert.strictEqual(normalized, "adani-gas-chamber-shinghpur");
  assert.strictEqual(canonical, "https://www.hindustanprojects.in/projects/adani-gas-chamber-shinghpur");
  assert(!canonical.includes("//projects/"), "Canonical must not contain double slashes");
});

// 3. projects/ prefix
it("Case 3: 'projects/' prefix is stripped; prevents duplicate path prefix", () => {
  const input = "projects/adani-gas-chamber-shinghpur";
  const normalized = normalizeProjectSlug(input);
  const canonical = buildCanonicalUrl(input);

  assert.strictEqual(normalized, "adani-gas-chamber-shinghpur");
  assert.strictEqual(canonical, "https://www.hindustanprojects.in/projects/adani-gas-chamber-shinghpur");
  assert(!canonical.includes("/projects/projects/"), "Canonical must not contain duplicate path");
});

// 4. Duplicated projects/ prefix
it("Case 4: Duplicated '/projects/projects/' prefix is stripped completely", () => {
  const input = "/projects/projects/adani-gas-chamber-shinghpur";
  const normalized = normalizeProjectSlug(input);
  const canonical = buildCanonicalUrl(input);

  assert.strictEqual(normalized, "adani-gas-chamber-shinghpur");
  assert.strictEqual(canonical, "https://www.hindustanprojects.in/projects/adani-gas-chamber-shinghpur");
});

// 5. Triplicate projects/ with arbitrary slashes
it("Case 5: Triplicate '///projects///projects///projects///' prefix is cleanly stripped", () => {
  const input = "///projects///projects///projects///adani-gas-chamber-shinghpur///";
  const normalized = normalizeProjectSlug(input);
  const canonical = buildCanonicalUrl(input);

  assert.strictEqual(normalized, "adani-gas-chamber-shinghpur");
  assert.strictEqual(canonical, "https://www.hindustanprojects.in/projects/adani-gas-chamber-shinghpur");
});

// 6. Second corrupted project canonical output
it("Case 6: Second corrupted project resolves to valid canonical URL", () => {
  const input = "expansion-of-weaving-department-airjet-ajay-syntex-pvt-ltd";
  const normalized = normalizeProjectSlug(input);
  const canonical = buildCanonicalUrl(input);

  assert.strictEqual(normalized, "expansion-of-weaving-department-airjet-ajay-syntex-pvt-ltd");
  assert.strictEqual(canonical, "https://www.hindustanprojects.in/projects/expansion-of-weaving-department-airjet-ajay-syntex-pvt-ltd");
});

console.log("\n------------------------------------------------------------------");
console.log(`TOTAL NORMALIZATION TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("------------------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
}
