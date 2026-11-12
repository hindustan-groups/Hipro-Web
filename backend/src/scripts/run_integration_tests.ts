import { spawnSync } from "child_process";
import path from "path";
import { parseDatabaseDestination } from "../lib/databaseSafety";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const REQUIRED_TEST_DB = "hipro_ci_test";

// -----------------------------------------------------------------------------
// STRICT CI & RUNTIME DATABASE ISOLATION VERIFICATION (FAIL-CLOSED)
// -----------------------------------------------------------------------------
const rawUrl = process.env.DATABASE_URL;

if (!rawUrl || rawUrl.trim() === "") {
  console.error("\n================================================================================");
  console.error("FATAL DATABASE ISOLATION ERROR: Missing DATABASE_URL configuration!");
  console.error("  Rule: An explicit DATABASE_URL targeting 'hipro_ci_test' on localhost is required.");
  console.error("  Failing closed to prevent accidental fallback or unintended database connections.");
  console.error("================================================================================\n");
  process.exit(1);
}

const activeDbUrl = rawUrl.trim();

let dest: { hostname: string; databaseName: string };
try {
  dest = parseDatabaseDestination(activeDbUrl);
} catch (err: any) {
  console.error("\n================================================================================");
  console.error(`FATAL DATABASE ISOLATION ERROR: Invalid or malformed DATABASE_URL: ${err.message}`);
  console.error("  Failing closed to prevent unintended database connections.");
  console.error("================================================================================\n");
  process.exit(1);
}

// Check for unparseable or unsupported sentinel returned by databaseSafety
if (dest.hostname.startsWith("<") || dest.databaseName.startsWith("<")) {
  console.error("\n================================================================================");
  console.error("FATAL DATABASE ISOLATION ERROR: Invalid or unparseable DATABASE_URL!");
  console.error(`  Diagnostics: Host "${dest.hostname}", Database "${dest.databaseName}"`);
  console.error("  Rule: A valid PostgreSQL connection URL is required.");
  console.error("================================================================================\n");
  process.exit(1);
}

// 1. Mandatory Loopback-Only Host Verification
if (!LOOPBACK_HOSTS.has(dest.hostname.toLowerCase())) {
  console.error("\n================================================================================");
  console.error("FATAL DATABASE ISOLATION ERROR: Remote database connection strictly blocked!");
  console.error(`  Host Attempted: "${dest.hostname}" (Not a recognized loopback address)`);
  console.error("  Rule: Integration tests must run ONLY against local loopback (localhost / 127.0.0.1).");
  console.error("================================================================================\n");
  process.exit(1);
}

// 2. Strict Exact Database Name Enforcement
if (dest.databaseName.toLowerCase() !== REQUIRED_TEST_DB) {
  console.error("\n================================================================================");
  console.error(`FATAL DATABASE ISOLATION ERROR: Unauthorized database target "${dest.databaseName}"!`);
  console.error(`  Expected Target: "${REQUIRED_TEST_DB}"`);
  console.error(`  Received Target: "${dest.databaseName}"`);
  console.error("  Rule: Integration tests must target ONLY the isolated disposable 'hipro_ci_test' database.");
  console.error("  Protection: Active developer database (hipro_local_dev) and production are guarded.");
  console.error("================================================================================\n");
  process.exit(1);
}

// 3. Known Production Signature Blocking (Defense in Depth)
const forbiddenKeywords = ["neon.tech", "render.com", "supabase.co", "aws.com", "azure.com", "production", "prod"];
for (const kw of forbiddenKeywords) {
  if (activeDbUrl.toLowerCase().includes(kw)) {
    console.error("\n================================================================================");
    console.error(`FATAL DATABASE ISOLATION ERROR: Forbidden keyword '${kw}' detected in DATABASE_URL!`);
    console.error("  Integration test execution aborted immediately to protect cloud environments.");
    console.error("================================================================================\n");
    process.exit(1);
  }
}

// Inject validated database URL into environment
process.env.DATABASE_URL = activeDbUrl;

const integrationTests = [
  "test_phase2_projects_api.ts",
  "test_phase3_admin_cms.ts",
  "test_phase4_public_listing.ts",
  "test_phase5_project_detail.ts",
  "test_phase6_projects_seo.ts",
  "test_phase7_projects_final.ts",
  "test_projects_domain_regression.ts",
  "test_rate_limiting.ts",
];

console.log("================================================================================");
console.log("       HiPRO ECOSYSTEM: ISOLATED INTEGRATION TEST SUITE RUNNER                  ");
console.log("================================================================================");
console.log(`Isolated Database Target: ${dest.hostname}:5432/${dest.databaseName}`);
console.log("Database Isolation Guard: VERIFIED (Strict Loopback & 'hipro_ci_test' Only)\n");

let passedSuites = 0;
let failedSuites = 0;

const isWindows = process.platform === "win32";
const npxCmd = isWindows ? "npx.cmd" : "npx";

for (const testFile of integrationTests) {
  const scriptPath = path.resolve(__dirname, testFile);
  console.log(`\n▶ RUNNING INTEGRATION SUITE: ${testFile}`);
  
  const result = spawnSync(npxCmd, ["tsx", scriptPath], {
    stdio: "inherit",
    shell: isWindows,
    env: { ...process.env, DATABASE_URL: activeDbUrl },
  });

  if (result.status === 0) {
    passedSuites++;
  } else {
    console.error(`\n❌ SUITE FAILED: ${testFile} (Exit code: ${result.status})`);
    failedSuites++;
    process.exit(result.status || 1);
  }
}

console.log("\n================================================================================");
console.log(`INTEGRATION SUITES COMPLETE: ${passedSuites}/${integrationTests.length} PASSED (${failedSuites} FAILED)`);
console.log("================================================================================\n");
