/**
 * Comprehensive verification & regression test suite for HiPRO Site Stats Data Flow & Synchronization.
 * Run directly with Node: node test/admin-site-stats.test.mjs
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("==========================================================");
console.log("    HiPRO SITE STATS SYNCHRONIZATION REGRESSION SUITE     ");
console.log("==========================================================\n");

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

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`[PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${desc}`);
    console.error(`       Error: ${err.message}`);
    failed++;
  }
}

// -------------------------------------------------------------
// 1. Hero.tsx Hardcoded Override Elimination
// -------------------------------------------------------------
console.log("--- 1. Hero.tsx Hardcoded Override Audit ---");

const heroFile = path.resolve(__dirname, "../components/Hero.tsx");
const heroContent = fs.readFileSync(heroFile, "utf-8");

it("Hero.tsx does NOT define verifiedStatsMap", () => {
  assert.strictEqual(
    heroContent.includes("verifiedStatsMap"),
    false,
    "verifiedStatsMap was found in Hero.tsx"
  );
});

it("Hero.tsx does NOT override stat values with hardcoded strings", () => {
  assert.strictEqual(
    heroContent.includes("verifiedStatsMap[s.label]"),
    false,
    "Hardcoded stat value override detected in Hero.tsx"
  );
});

it("Hero.tsx initial state uses initialStats directly", () => {
  assert.match(
    heroContent,
    /const\s+\[stats,\s*setStats\]\s*=\s*useState<StatType\[\]>\(\s*initialStats\s*&&\s*initialStats\.length\s*>\s*0\s*\?\s*initialStats\s*:\s*defaultStats\s*\)/,
    "Hero.tsx should initialize stats with initialStats directly"
  );
});

it("Hero.tsx useEffect synchronizes initialStats directly", () => {
  assert.match(
    heroContent,
    /useEffect\(\(\)\s*=>\s*\{\s*if\s*\(initialStats\s*&&\s*initialStats\.length\s*>\s*0\)\s*\{\s*setStats\(initialStats\);\s*\}\s*\},/s,
    "Hero.tsx should update stats state with initialStats directly"
  );
});

// -------------------------------------------------------------
// 2. Admin Stats CMS Cache Revalidation Audit
// -------------------------------------------------------------
console.log("\n--- 2. Admin Stats CMS Cache Revalidation ---");

const adminStatsFile = path.resolve(__dirname, "../app/admin/stats/page.tsx");
const adminStatsContent = fs.readFileSync(adminStatsFile, "utf-8");

it("Admin Stats CMS calls /api/revalidate on successful PATCH", () => {
  assert.strictEqual(
    adminStatsContent.includes('fetch("/api/revalidate"'),
    true,
    "Admin Stats CMS must trigger cache revalidation on successful update"
  );
});

it("Admin Stats CMS revalidates 'stats' tag and '/' path", () => {
  assert.match(
    adminStatsContent,
    /tag:\s*"stats",\s*paths:\s*\[.*"\/"/,
    "Admin Stats CMS must pass tag: 'stats' and include '/' in revalidated paths"
  );
});

// -------------------------------------------------------------
// 3. Schema & Data Flow Consistency
// -------------------------------------------------------------
console.log("\n--- 3. Schema & Data Flow Consistency ---");

const typesFile = path.resolve(__dirname, "../lib/types.ts");
const typesContent = fs.readFileSync(typesFile, "utf-8");

it("Stats interface in types.ts has required fields (id, label, value, icon, order)", () => {
  assert.match(typesContent, /export interface Stats \{/);
  assert.match(typesContent, /label:\s*string;/);
  assert.match(typesContent, /value:\s*string;/);
  assert.match(typesContent, /icon:\s*string;/);
  assert.match(typesContent, /order\?:\s*number;/);
});

const homePageFile = path.resolve(__dirname, "../app/(site)/page.tsx");
const homePageContent = fs.readFileSync(homePageFile, "utf-8");

it("Home Page fetches 'stats' via findAll<StatType>('stats')", () => {
  assert.match(
    homePageContent,
    /findAll<StatType>\("stats"\)/,
    "page.tsx must fetch 'stats' collection"
  );
});

it("Home Page passes statsdata to <Hero />", () => {
  assert.match(
    homePageContent,
    /<Hero\s+initialSlides=\{slidedata\}\s+initialStats=\{statsdata\}\s*\/>/,
    "page.tsx must pass dynamic statsdata as initialStats to Hero"
  );
});

// -------------------------------------------------------------
// 4. Live Local SSR Verification
// -------------------------------------------------------------
console.log("\n--- 4. Live Local SSR Verification ---");

await itAsync("Local SSR renders dynamic stats matching /api/stats exactly", async () => {
  const statsRes = await fetch("http://localhost:3000/api/stats");
  const statsJson = await statsRes.json();
  assert.ok(statsJson.success, "Failed to fetch /api/stats");
  const dbStats = statsJson.data;

  const res = await fetch("http://localhost:3000");
  assert.strictEqual(res.status, 200, "Home page returned non-200");
  const html = await res.text();
  
  const statsMatch = html.match(/divide-x divide-white\/10[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  assert.ok(statsMatch, "Stats bar rendered in HTML");
  const bar = statsMatch[0];

  // Dynamic values for top 4 stats must appear in hero stats bar
  for (const s of dbStats.slice(0, 4)) {
    assert.ok(
      bar.includes(s.value),
      `Dynamic value "${s.value}" for "${s.label}" was not found in hero stats bar`
    );
  }

  // HomeAbout badge must use the dynamic project count
  const projectStat = dbStats.find((s) => /project/i.test(s.label));
  if (projectStat) {
    assert.ok(
      html.includes(`${projectStat.value}<!-- --> Projects Handed Over`) || html.includes(`${projectStat.value} Projects Handed Over`),
      `HomeAbout did not render dynamic project count "${projectStat.value} Projects Handed Over"`
    );
    assert.strictEqual(
      html.includes("150+ Projects Handed Over") && projectStat.value !== "150+",
      false,
      "Hardcoded '150+ Projects Handed Over' should not appear when DB has a different value"
    );
  }
});

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n==========================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("==========================================================");

if (failed > 0) {
  process.exit(1);
}
