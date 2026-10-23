/**
 * PHASE 2C-1O: Local Safety Test Suite - Frontend Environment & Fail-Closed Guard
 * 
 * Remediations verified:
 * - F-01: Staging unconditional remote-host exemption removed. No dedicated staging
 *         backend is provisioned; staging strictly follows loopback-only rule.
 * - F-02: Legacy-host detection uses post-parse exact hostname comparison.
 *         Pre-parse substring matching (.includes()) is removed.
 * - F-03: Comprehensive runtime subprocess tests for staging (RT-S1 through RT-S4)
 *         and F-02 substring-safety regression tests for both backendUrl.ts and next.config.mjs.
 * - F-04: admin-site-stats Hero regex prop tolerance verified in sister suite.
 * 
 * Run with: node test/local-safety.test.mjs
 */

import assert from "node:assert";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");

console.log("==========================================================");
console.log("     PHASE 2C-1O: FRONTEND LOCAL SAFETY RUNTIME SUITE     ");
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

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

// Emulate getBackendUrl logic from frontend/lib/backendUrl.ts (Phase 2C-1O remediated)
function resolveBackendUrl(envBackendUrl, nodeEnv) {
  let rawUrl = envBackendUrl;
  const env = nodeEnv ?? "";

  if (!rawUrl || rawUrl.trim() === "") {
    if (env === "production") {
      rawUrl = "https://hipro-backend-749v.onrender.com";
    } else {
      throw new Error(
        `[FATAL CONFIG ERROR] BACKEND_API_URL is missing in "${env || "unset"}" mode! ` +
        `Refusing to fall back to live production backend (Render). ` +
        `Please define BACKEND_API_URL=http://localhost:5000 in your frontend/.env.local file.`
      );
    }
  }

  let url = rawUrl.trim();

  // 1. Strict scheme requirement: must explicitly begin with http:// or https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error(
      `[FATAL CONFIG ERROR] BACKEND_API_URL ("${rawUrl}") must begin with an explicit "http://" or "https://" scheme. ` +
      `Ambiguous schemes, protocol-relative URLs, and typos are rejected.`
    );
  }

  // 2. Parse and validate URL structure
  let parsed;
  try {
    parsed = new URL(url);
  } catch (err) {
    throw new Error(
      `[FATAL CONFIG ERROR] Malformed BACKEND_API_URL ("${rawUrl}"): ${err.message}`
    );
  }

  // 3. Reject embedded credentials (username / password)
  if (parsed.username || parsed.password) {
    throw new Error(
      `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain embedded user credentials.`
    );
  }

  // 4. Reject query strings
  if (parsed.search && parsed.search !== "") {
    throw new Error(
      `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain query strings ("${parsed.search}").`
    );
  }

  // 5. Reject URL fragments / hash
  if (parsed.hash && parsed.hash !== "") {
    throw new Error(
      `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain URL fragments ("${parsed.hash}").`
    );
  }

  // 6. Enforce allowed path behavior: base URL must be root origin only (no subpaths)
  if (parsed.pathname !== "/" && parsed.pathname !== "") {
    throw new Error(
      `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain a path prefix ("${parsed.pathname}"). ` +
      `The base URL must be the root origin (e.g. "http://localhost:5000") as callers automatically append "/api/...".`
    );
  }

  // 7. Legacy hostname check (F-02: post-parse exact hostname match)
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === "hipro-web-1.onrender.com") {
    if (env === "production") {
      return "https://hipro-backend-749v.onrender.com";
    } else {
      throw new Error(
        `[FATAL CONFIG ERROR] Legacy Render backend URL ("hipro-web-1.onrender.com") detected in "${env || "unset"}" mode! ` +
        `Refusing to auto-heal to live Render backend. Please configure a local backend URL (http://localhost:5000).`
      );
    }
  }

  // 8. Enforce local loopback policy in non-production modes (F-01: includes staging)
  if (env !== "production") {
    if (!LOOPBACK_HOSTS.has(hostname)) {
      throw new Error(
        `[FATAL CONFIG ERROR] Non-local backend host ("${hostname}") is blocked in "${env || "unset"}" mode! ` +
        `Only loopback hosts (localhost, 127.0.0.1, [::1]) are permitted in non-production environments. ` +
        `If a dedicated staging backend is required, its hostname must be approved via a separate security review.`
      );
    }
  }

  return url.replace(/\/+$/, "");
}

// ====================================================
// SECTION A: UNIT & CONFIGURATION SPECIFICATION TESTS
// ====================================================

// ----------------------------------------------------
// Test 1: Missing BACKEND_API_URL fails closed in non-prod
// ----------------------------------------------------
it("Non-production modes: Missing BACKEND_API_URL throws fatal error (fail-closed)", () => {
  for (const envMode of ["development", "test", "staging", "", undefined]) {
    assert.throws(
      () => resolveBackendUrl(undefined, envMode),
      (err) => {
        assert(err.message.includes("[FATAL CONFIG ERROR]"));
        assert(err.message.includes("Refusing to fall back to live production backend"));
        return true;
      }
    );
  }
});

// ----------------------------------------------------
// Test 2: Whitespace BACKEND_API_URL fails closed in dev/staging
// ----------------------------------------------------
it("Development and staging modes: Empty/whitespace BACKEND_API_URL throws fatal error", () => {
  for (const envMode of ["development", "staging"]) {
    assert.throws(
      () => resolveBackendUrl("   ", envMode),
      (err) => {
        assert(err.message.includes("[FATAL CONFIG ERROR]"));
        return true;
      }
    );
  }
});

// ----------------------------------------------------
// Test 3: Local backend loopback hosts accepted & normalized
// ----------------------------------------------------
it("Development mode: Configured local URL (http://localhost:5000) resolves correctly", () => {
  const resolved = resolveBackendUrl("http://localhost:5000/", "development");
  assert.strictEqual(resolved, "http://localhost:5000");
});

it("Development mode: Explicit IPv4 loopback (http://127.0.0.1:5000) resolves correctly", () => {
  const resolved = resolveBackendUrl("http://127.0.0.1:5000", "development");
  assert.strictEqual(resolved, "http://127.0.0.1:5000");
});

it("Development mode: Explicit IPv6 loopback (http://[::1]:5000) resolves correctly", () => {
  const resolved = resolveBackendUrl("http://[::1]:5000", "development");
  assert.strictEqual(resolved, "http://[::1]:5000");
});

// ----------------------------------------------------
// Test 3B: Protocol validation & rejection of ambiguous URLs
// ----------------------------------------------------
it("Ambiguous schemes (single slash typo, bare host, ftp) are rejected", () => {
  assert.throws(
    () => resolveBackendUrl("http:/localhost:5000", "development"),
    /must begin with an explicit "http:\/\/" or "https:\/\/" scheme/
  );
  assert.throws(
    () => resolveBackendUrl("localhost:5000", "development"),
    /must begin with an explicit "http:\/\/" or "https:\/\/" scheme/
  );
  assert.throws(
    () => resolveBackendUrl("ftp://localhost:5000", "development"),
    /must begin with an explicit "http:\/\/" or "https:\/\/" scheme/
  );
});

it("Malformed URLs (missing hostname or invalid syntax) are rejected with fatal error", () => {
  assert.throws(
    () => resolveBackendUrl("http://", "development"),
    /Malformed BACKEND_API_URL/
  );
  assert.throws(
    () => resolveBackendUrl("http://[::1", "development"),
    /Malformed BACKEND_API_URL/
  );
});

// ----------------------------------------------------
// Test 3C: Rejection of credentials, query strings, fragments, and subpaths
// ----------------------------------------------------
it("Reject embedded credentials (username / password) in BACKEND_API_URL", () => {
  assert.throws(
    () => resolveBackendUrl("http://admin:secret@localhost:5000", "development"),
    /BACKEND_API_URL must not contain embedded user credentials/
  );
});

it("Reject query strings in BACKEND_API_URL", () => {
  assert.throws(
    () => resolveBackendUrl("http://localhost:5000?token=xyz", "development"),
    /BACKEND_API_URL must not contain query strings/
  );
});

it("Reject URL fragments in BACKEND_API_URL", () => {
  assert.throws(
    () => resolveBackendUrl("http://localhost:5000#section", "development"),
    /BACKEND_API_URL must not contain URL fragments/
  );
});

it("Reject path prefix in BACKEND_API_URL (base origin URL only)", () => {
  assert.throws(
    () => resolveBackendUrl("http://localhost:5000/api", "development"),
    /BACKEND_API_URL must not contain a path prefix/
  );
  assert.throws(
    () => resolveBackendUrl("http://localhost:5000/v1", "development"),
    /BACKEND_API_URL must not contain a path prefix/
  );
});

// ----------------------------------------------------
// Test 3D: Enforce loopback hosts in development, test, and staging (F-01)
// ----------------------------------------------------
it("Reject remote backend hosts in development, test, and staging environments (F-01)", () => {
  for (const envMode of ["development", "test", "staging", ""]) {
    assert.throws(
      () => resolveBackendUrl("https://hipro-backend-749v.onrender.com", envMode),
      new RegExp(`Non-local backend host \\("hipro-backend-749v\\.onrender\\.com"\\) is blocked in "${envMode || "unset"}" mode!`)
    );
  }
});

// ----------------------------------------------------
// Test 4: Legacy Render URL behavior & Substring Safety (F-02)
// ----------------------------------------------------
it("Legacy Render URL: Non-production modes fail closed and refuse auto-healing", () => {
  for (const envMode of ["development", "test", "staging", "", undefined]) {
    assert.throws(
      () => resolveBackendUrl("https://hipro-web-1.onrender.com", envMode),
      (err) => {
        assert(err.message.includes("[FATAL CONFIG ERROR]"));
        assert(err.message.includes("Legacy Render backend URL"));
        assert(err.message.includes("Refusing to auto-heal to live Render backend"));
        return true;
      }
    );
  }
});

it("Legacy Render URL: Production mode auto-heals to active Render backend", () => {
  const resolved = resolveBackendUrl("https://hipro-web-1.onrender.com", "production");
  assert.strictEqual(resolved, "https://hipro-backend-749v.onrender.com");
});

it("F-02 Substring Safety: Unrelated hosts with legacy string as prefix/suffix are not auto-healed", () => {
  // In non-prod, attacker host is blocked as non-local, NOT matched as legacy host
  assert.throws(
    () => resolveBackendUrl("http://attacker-hipro-web-1.onrender.com:5000", "development"),
    /Non-local backend host \("attacker-hipro-web-1\.onrender\.com"\) is blocked/
  );
  // In production, attacker host is NOT auto-healed to Render
  const prodResolved = resolveBackendUrl("https://attacker-hipro-web-1.onrender.com", "production");
  assert.strictEqual(prodResolved, "https://attacker-hipro-web-1.onrender.com");
});

// ----------------------------------------------------
// Test 5: Production fallback preserved strictly in prod
// ----------------------------------------------------
it("Production mode: Undefined BACKEND_API_URL preserves existing Render fallback", () => {
  const resolved = resolveBackendUrl(undefined, "production");
  assert.strictEqual(resolved, "https://hipro-backend-749v.onrender.com");
});

it("Production mode: Explicit BACKEND_API_URL is respected", () => {
  const resolved = resolveBackendUrl("https://api.hindustanprojects.in", "production");
  assert.strictEqual(resolved, "https://api.hindustanprojects.in");
});

// ----------------------------------------------------
// Test 6: Verify frontend/.env.example template safety
// ----------------------------------------------------
it("frontend/.env.example: Defaults to localhost:5000 (not live Render backend)", () => {
  const envExamplePath = path.resolve(__dirname, "../.env.example");
  const content = fs.readFileSync(envExamplePath, "utf-8");
  assert(
    content.includes("BACKEND_API_URL=http://localhost:5000"),
    "Expected BACKEND_API_URL=http://localhost:5000 in .env.example"
  );
  assert(
    content.includes("NEXT_PUBLIC_API_URL=http://localhost:5000"),
    "Expected NEXT_PUBLIC_API_URL=http://localhost:5000 in .env.example"
  );
});

// ----------------------------------------------------
// Test 7: Verify lib/backendUrl.ts source code safety
// ----------------------------------------------------
it("frontend/lib/backendUrl.ts: Implements inverted production throw guard", () => {
  const helperPath = path.resolve(__dirname, "../lib/backendUrl.ts");
  const content = fs.readFileSync(helperPath, "utf-8");
  assert(content.includes('env === "production"'));
  assert(content.includes("[FATAL CONFIG ERROR]"));
  assert(content.includes("Refusing to fall back to the live production backend"));
});

// ----------------------------------------------------
// Test 8: Verify frontend/next.config.mjs source code safety
// ----------------------------------------------------
it("frontend/next.config.mjs: Implements inverted production throw guard", () => {
  const configPath = path.resolve(__dirname, "../next.config.mjs");
  const content = fs.readFileSync(configPath, "utf-8");
  assert(content.includes('env === "production"'));
  assert(content.includes("[FATAL CONFIG ERROR]"));
});

// ----------------------------------------------------
// Test 9: Verify callers import getBackendUrl / BACKEND_URL
// ----------------------------------------------------
it("Callers in frontend/lib use getBackendUrl/BACKEND_URL from backendUrl.ts", () => {
  const authPath = path.resolve(__dirname, "../lib/auth.ts");
  const dbPath = path.resolve(__dirname, "../lib/db.ts");
  const hbsPath = path.resolve(__dirname, "../lib/hbsData.ts");

  assert(fs.readFileSync(authPath, "utf-8").includes('from "./backendUrl"'));
  assert(fs.readFileSync(dbPath, "utf-8").includes('from "./backendUrl"'));
  assert(fs.readFileSync(hbsPath, "utf-8").includes('from "./backendUrl"'));
});

// ====================================================
// SECTION B: ACTUAL RUNTIME EXECUTION TESTS (Task 6 & F-03)
// Executes backendUrl.ts and next.config.mjs via child process
// ====================================================

function runActualBackendUrl(envBackendUrl, nodeEnv) {
  const env = { ...process.env };
  if (envBackendUrl === undefined) delete env.BACKEND_API_URL;
  else env.BACKEND_API_URL = envBackendUrl;

  if (nodeEnv === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = nodeEnv;

  const script = 'import("./lib/backendUrl.ts").then(m => console.log("RESOLVED:" + m.getBackendUrl()));';
  const res = spawnSync(process.execPath, [
    "--experimental-strip-types",
    "--no-warnings",
    "-e",
    script
  ], {
    cwd: FRONTEND_DIR,
    env,
    encoding: "utf-8"
  });

  if (res.status === 0) {
    const match = res.stdout.match(/RESOLVED:(.*)/);
    return { ok: true, value: match ? match[1].trim() : res.stdout.trim() };
  } else {
    return { ok: false, error: (res.stderr || res.stdout).trim() };
  }
}

function runActualNextConfig(envBackendUrl, nodeEnv) {
  const env = { ...process.env };
  if (envBackendUrl === undefined) delete env.BACKEND_API_URL;
  else env.BACKEND_API_URL = envBackendUrl;

  if (nodeEnv === undefined) delete env.NODE_ENV;
  else env.NODE_ENV = nodeEnv;

  const script = 'import("./next.config.mjs").then(m => console.log("RESOLVED:" + (m.default ? "OK" : "NO_DEFAULT")));';
  const res = spawnSync(process.execPath, [
    "--no-warnings",
    "-e",
    script
  ], {
    cwd: FRONTEND_DIR,
    env,
    encoding: "utf-8"
  });

  if (res.status === 0) {
    return { ok: true };
  } else {
    return { ok: false, error: (res.stderr || res.stdout).trim() };
  }
}

it("RUNTIME backendUrl.ts: Missing BACKEND_API_URL throws fatal error in dev/test/unset", () => {
  for (const envMode of ["development", "test", undefined]) {
    const res = runActualBackendUrl(undefined, envMode);
    assert.strictEqual(res.ok, false, `Expected failure in ${envMode} mode`);
    assert(res.error.includes("[FATAL CONFIG ERROR]"));
    assert(res.error.includes("Refusing to fall back to the live production backend"));
  }
});

it("RUNTIME backendUrl.ts: Local loopback hosts (localhost, 127.0.0.1) resolve correctly", () => {
  const r1 = runActualBackendUrl("http://localhost:5000", "development");
  assert.strictEqual(r1.ok, true, `Failed: ${r1.error}`);
  assert.strictEqual(r1.value, "http://localhost:5000");

  const r2 = runActualBackendUrl("http://127.0.0.1:5000/", "development");
  assert.strictEqual(r2.ok, true, `Failed: ${r2.error}`);
  assert.strictEqual(r2.value, "http://127.0.0.1:5000");
});

it("RUNTIME backendUrl.ts: IPv6 loopback (http://[::1]:5000) resolves correctly", () => {
  const res = runActualBackendUrl("http://[::1]:5000", "development");
  assert.strictEqual(res.ok, true, `Failed: ${res.error}`);
  assert.strictEqual(res.value, "http://[::1]:5000");
});

it("RUNTIME backendUrl.ts: Malformed schemes (http:/..., bare host, ftp://) are rejected", () => {
  for (const badUrl of ["http:/localhost:5000", "localhost:5000", "ftp://localhost:5000", "http://"]) {
    const res = runActualBackendUrl(badUrl, "development");
    assert.strictEqual(res.ok, false, `Expected ${badUrl} to fail`);
    assert(res.error.includes("[FATAL CONFIG ERROR]"));
  }
});

it("RUNTIME backendUrl.ts: Embedded credentials are rejected", () => {
  const res = runActualBackendUrl("http://user:pass@localhost:5000", "development");
  assert.strictEqual(res.ok, false);
  assert(res.error.includes("must not contain embedded user credentials"));
});

it("RUNTIME backendUrl.ts: Query strings are rejected", () => {
  const res = runActualBackendUrl("http://localhost:5000?foo=bar", "development");
  assert.strictEqual(res.ok, false);
  assert(res.error.includes("must not contain query strings"));
});

it("RUNTIME backendUrl.ts: URL fragments are rejected", () => {
  const res = runActualBackendUrl("http://localhost:5000#section", "development");
  assert.strictEqual(res.ok, false);
  assert(res.error.includes("must not contain URL fragments"));
});

it("RUNTIME backendUrl.ts: Subpath prefixes (/api, /v1) are rejected", () => {
  for (const pathUrl of ["http://localhost:5000/api", "http://localhost:5000/v1"]) {
    const res = runActualBackendUrl(pathUrl, "development");
    assert.strictEqual(res.ok, false);
    assert(res.error.includes("must not contain a path prefix"));
  }
});

it("RUNTIME backendUrl.ts: Remote hosts in dev/test/unset are blocked", () => {
  for (const envMode of ["development", "test", undefined]) {
    const res = runActualBackendUrl("https://hipro-backend-749v.onrender.com", envMode);
    assert.strictEqual(res.ok, false);
    assert(res.error.includes("Non-local backend host"));
  }
});

it("RUNTIME backendUrl.ts: Production fallback to Render is preserved when undefined", () => {
  const res = runActualBackendUrl(undefined, "production");
  assert.strictEqual(res.ok, true, `Failed: ${res.error}`);
  assert.strictEqual(res.value, "https://hipro-backend-749v.onrender.com");
});

it("RUNTIME backendUrl.ts: Legacy Render domain auto-healed in production, blocked in dev", () => {
  const prodRes = runActualBackendUrl("https://hipro-web-1.onrender.com", "production");
  assert.strictEqual(prodRes.ok, true, `Failed: ${prodRes.error}`);
  assert.strictEqual(prodRes.value, "https://hipro-backend-749v.onrender.com");

  const devRes = runActualBackendUrl("https://hipro-web-1.onrender.com", "development");
  assert.strictEqual(devRes.ok, false);
  assert(devRes.error.includes("Legacy Render backend URL"));
});

// -------------------------------------------------------------
// F-03 & F-01: Staging Runtime Subprocess Tests (RT-S1 to RT-S4)
// -------------------------------------------------------------
it("RUNTIME backendUrl.ts [RT-S1]: Missing BACKEND_API_URL throws fatal error in staging", () => {
  const res = runActualBackendUrl(undefined, "staging");
  assert.strictEqual(res.ok, false, "Expected staging without BACKEND_API_URL to fail closed");
  assert(res.error.includes("[FATAL CONFIG ERROR]"));
  assert(res.error.includes("Refusing to fall back to the live production backend"));
});

it("RUNTIME backendUrl.ts [RT-S2]: Local loopback hosts resolve correctly in staging", () => {
  const r1 = runActualBackendUrl("http://localhost:5000", "staging");
  assert.strictEqual(r1.ok, true, `Failed: ${r1.error}`);
  assert.strictEqual(r1.value, "http://localhost:5000");

  const r2 = runActualBackendUrl("http://127.0.0.1:5000", "staging");
  assert.strictEqual(r2.ok, true, `Failed: ${r2.error}`);
  assert.strictEqual(r2.value, "http://127.0.0.1:5000");

  const r3 = runActualBackendUrl("http://[::1]:5000", "staging");
  assert.strictEqual(r3.ok, true, `Failed: ${r3.error}`);
  assert.strictEqual(r3.value, "http://[::1]:5000");
});

it("RUNTIME backendUrl.ts [RT-S3]: Remote hosts are blocked in staging (F-01 fail-closed)", () => {
  for (const remoteUrl of [
    "https://hipro-backend-749v.onrender.com",
    "https://staging-api.hindustanprojects.in",
    "https://attacker.com"
  ]) {
    const res = runActualBackendUrl(remoteUrl, "staging");
    assert.strictEqual(res.ok, false, `Expected remote host ${remoteUrl} to be blocked in staging`);
    assert(res.error.includes("Non-local backend host"));
  }
});

it("RUNTIME backendUrl.ts [RT-S4]: Legacy Render domain in staging fails closed and refuses auto-healing", () => {
  const res = runActualBackendUrl("https://hipro-web-1.onrender.com", "staging");
  assert.strictEqual(res.ok, false, "Expected legacy Render host to be rejected in staging");
  assert(res.error.includes("Legacy Render backend URL"));
  assert(res.error.includes("Refusing to auto-heal to live Render backend"));
});

// -------------------------------------------------------------
// F-02: Substring attack runtime tests
// -------------------------------------------------------------
it("RUNTIME backendUrl.ts [F-02]: Attacker host with legacy substring is blocked as non-local, not auto-healed", () => {
  const res = runActualBackendUrl("http://attacker-hipro-web-1.onrender.com:5000", "development");
  assert.strictEqual(res.ok, false);
  assert(res.error.includes("Non-local backend host"));
  assert(!res.error.includes("Legacy Render backend URL"), "Should not be identified as legacy Render host");
});

// -------------------------------------------------------------
// next.config.mjs Runtime Subprocess Tests
// -------------------------------------------------------------
it("RUNTIME next.config.mjs: Missing BACKEND_API_URL throws fatal error in development", () => {
  const res = runActualNextConfig(undefined, "development");
  assert.strictEqual(res.ok, false);
  assert(res.error.includes("[FATAL CONFIG ERROR]"));
  assert(res.error.includes("Refusing to fall back to live production backend"));
});

it("RUNTIME next.config.mjs [RT-S1]: Missing BACKEND_API_URL throws fatal error in staging", () => {
  const res = runActualNextConfig(undefined, "staging");
  assert.strictEqual(res.ok, false);
  assert(res.error.includes("[FATAL CONFIG ERROR]"));
  assert(res.error.includes("Refusing to fall back to live production backend"));
});

it("RUNTIME next.config.mjs: Valid local loopback loads successfully in dev and staging", () => {
  for (const envMode of ["development", "staging"]) {
    const r1 = runActualNextConfig("http://localhost:5000", envMode);
    assert.strictEqual(r1.ok, true, `Failed for localhost in ${envMode}: ${r1.error}`);

    const r2 = runActualNextConfig("http://[::1]:5000", envMode);
    assert.strictEqual(r2.ok, true, `Failed for [::1] in ${envMode}: ${r2.error}`);
  }
});

it("RUNTIME next.config.mjs [RT-S3]: Remote hosts are blocked in staging", () => {
  const res = runActualNextConfig("https://hipro-backend-749v.onrender.com", "staging");
  assert.strictEqual(res.ok, false);
  assert(res.error.includes("Non-local backend host"));
});

it("RUNTIME next.config.mjs [RT-S4]: Legacy Render domain in staging fails closed", () => {
  const res = runActualNextConfig("https://hipro-web-1.onrender.com", "staging");
  assert.strictEqual(res.ok, false);
  assert(res.error.includes("Legacy Render backend URL"));
});

it("RUNTIME next.config.mjs [F-02]: Attacker host with legacy substring is blocked as non-local", () => {
  const res = runActualNextConfig("http://attacker-hipro-web-1.onrender.com:5000", "development");
  assert.strictEqual(res.ok, false);
  assert(res.error.includes("Non-local backend host"));
});

it("RUNTIME next.config.mjs: Malformed scheme, credentials, query, fragment, subpath, remote host fail closed", () => {
  const invalidCases = [
    "http:/localhost:5000",
    "http://user:pass@localhost:5000",
    "http://localhost:5000?foo=bar",
    "http://localhost:5000#section",
    "http://localhost:5000/api",
    "https://hipro-backend-749v.onrender.com",
  ];
  for (const badUrl of invalidCases) {
    const res = runActualNextConfig(badUrl, "development");
    assert.strictEqual(res.ok, false, `Expected next.config.mjs to reject ${badUrl}`);
    assert(res.error.includes("[FATAL CONFIG ERROR]"), `Error did not include fatal config error: ${res.error}`);
  }
});

it("RUNTIME next.config.mjs: Production fallback to Render is preserved when undefined", () => {
  const res = runActualNextConfig(undefined, "production");
  assert.strictEqual(res.ok, true, `Failed: ${res.error}`);
});

console.log("\n----------------------------------------------------------");
console.log(`Results: ${passed} Passed, ${failed} Failed`);
console.log("----------------------------------------------------------\n");

if (failed > 0) {
  process.exit(1);
}
