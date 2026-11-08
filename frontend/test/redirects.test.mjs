/**
 * HiPRO Legacy URL Redirects Verification Suite (Gate 1A-2)
 *
 * Requirements:
 * - Permanent HTTP 308 redirects:
 *   - /blog -> /blogs
 *   - /cost-calculator -> /cost-estimator
 * - Preserve query strings
 * - Avoid redirect loops
 * - Avoid duplicate or conflicting rules
 * - Destination routes exist in the application
 * - Test exact status code (308) and Location header using live local HTTP requests
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, "..");
const TEST_PORT = 3456;

console.log("==========================================================");
console.log("     HiPRO GATE 1A-2: LEGACY URL REDIRECTS TEST SUITE     ");
console.log("==========================================================\n");

let passed = 0;
let failed = 0;

async function it(desc, fn) {
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

function requestHttp(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });
    req.on("error", reject);
    req.end();
  });
}

async function waitForServer(port, maxRetries = 100) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await requestHttp({ host: "127.0.0.1", port, path: "/", method: "GET", timeout: 1000 });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Server failed to start on port ${port} within timeout`);
}

async function runTests() {
  process.env.BACKEND_API_URL = "http://localhost:5000";
  process.env.NODE_ENV = "development";

  console.log("--- 1. Static Configuration & Guard Verification ---");
  const nextConfigModule = await import("../next.config.mjs");
  const nextConfig = nextConfigModule.default;

  await it("next.config.mjs exports async redirects function", async () => {
    assert(typeof nextConfig.redirects === "function", "redirects should be a function");
  });

  const redirects = await nextConfig.redirects();

  await it("next.config.mjs defines exactly 4 redirects", async () => {
    assert.strictEqual(redirects.length, 4, "Expected exactly 4 redirects");
  });

  await it("Redirect 1: /blog -> /blogs (permanent: true => HTTP 308)", async () => {
    const r = redirects.find((rule) => rule.source === "/blog");
    assert(r, "Missing redirect for /blog");
    assert.strictEqual(r.destination, "/blogs");
    assert.strictEqual(r.permanent, true);
  });

  await it("Redirect 2: /cost-calculator -> /cost-estimator (permanent: true => HTTP 308)", async () => {
    const r = redirects.find((rule) => rule.source === "/cost-calculator");
    assert(r, "Missing redirect for /cost-calculator");
    assert.strictEqual(r.destination, "/cost-estimator");
    assert.strictEqual(r.permanent, true);
  });

  await it("Redirect 3: /projects/projects-adani-gas-chamber-shinghpur -> /projects/adani-gas-chamber-shinghpur (permanent: true)", async () => {
    const r = redirects.find((rule) => rule.source === "/projects/projects-adani-gas-chamber-shinghpur");
    assert(r, "Missing redirect for Adani project corrupted slug");
    assert.strictEqual(r.destination, "/projects/adani-gas-chamber-shinghpur");
    assert.strictEqual(r.permanent, true);
  });

  await it("Redirect 4: /projects/expansion-of-weav-... -> /projects/expansion-of-weaving-department-airjet-ajay-syntex-pvt-ltd (permanent: true)", async () => {
    const r = redirects.find((rule) => rule.source === "/projects/expansion-of-weav-projects-expansion-of-weaving-department-airjet-ajay-syntexing-department-airjet-ajay-syntex-pvt-ltd");
    assert(r, "Missing redirect for Ajay Syntex corrupted slug");
    assert.strictEqual(r.destination, "/projects/expansion-of-weaving-department-airjet-ajay-syntex-pvt-ltd");
    assert.strictEqual(r.permanent, true);
  });

  await it("No duplicate source paths in redirects configuration", async () => {
    const sources = redirects.map((r) => r.source);
    const uniqueSources = new Set(sources);
    assert.strictEqual(sources.length, uniqueSources.size, "Found duplicate redirect sources");
  });

  await it("No redirect loops (destinations must not redirect back to sources)", async () => {
    const sources = new Set(redirects.map((r) => r.source));
    for (const r of redirects) {
      assert(!sources.has(r.destination), `Redirect loop detected: destination ${r.destination} is also a redirect source`);
    }
  });

  await it("Destination route /blogs exists in app/(site)/blogs/page.tsx", async () => {
    const blogPage = path.join(FRONTEND_DIR, "app", "(site)", "blogs", "page.tsx");
    assert(fs.existsSync(blogPage), "Destination page for /blogs does not exist");
  });

  await it("Destination route /cost-estimator exists in app/(site)/cost-estimator/page.tsx", async () => {
    const costPage = path.join(FRONTEND_DIR, "app", "(site)", "cost-estimator", "page.tsx");
    assert(fs.existsSync(costPage), "Destination page for /cost-estimator does not exist");
  });

  await it("All other Next.js configurations are intact (images, headers, rewrites, compress)", async () => {
    assert.strictEqual(nextConfig.compress, true);
    assert.strictEqual(nextConfig.poweredByHeader, false);
    assert(typeof nextConfig.images === "object");
    assert(typeof nextConfig.headers === "function");
    assert(typeof nextConfig.rewrites === "function");
  });

  console.log("\n--- 2. Live HTTP Server 308 Redirect Verification ---");
  const serverCmd = process.platform === "win32" ? "npx.cmd" : "npx";
  const serverProc = spawn(serverCmd, ["next", "start", "-p", String(TEST_PORT)], {
    cwd: FRONTEND_DIR,
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: "production",
      BACKEND_API_URL: "http://localhost:5000",
      PORT: String(TEST_PORT),
    },
    stdio: "pipe",
  });

  try {
    await waitForServer(TEST_PORT);
    console.log(`[READY] Next.js production server running on port ${TEST_PORT}\n`);

    await it("HTTP 308: GET /blog redirects to /blogs with Location header", async () => {
      const res = await requestHttp({
        host: "127.0.0.1",
        port: TEST_PORT,
        path: "/blog",
        method: "GET",
      });
      assert.strictEqual(res.statusCode, 308, `Expected status 308, got ${res.statusCode}`);
      assert.strictEqual(res.headers.location, "/blogs", `Expected Location /blogs, got ${res.headers.location}`);
    });

    await it("HTTP 308: GET /blog?category=commercial preserves query string in Location header", async () => {
      const res = await requestHttp({
        host: "127.0.0.1",
        port: TEST_PORT,
        path: "/blog?category=commercial&sort=desc",
        method: "GET",
      });
      assert.strictEqual(res.statusCode, 308, `Expected status 308, got ${res.statusCode}`);
      assert.strictEqual(
        res.headers.location,
        "/blogs?category=commercial&sort=desc",
        `Expected Location /blogs?category=commercial&sort=desc, got ${res.headers.location}`
      );
    });

    await it("HTTP 308: GET /cost-calculator redirects to /cost-estimator with Location header", async () => {
      const res = await requestHttp({
        host: "127.0.0.1",
        port: TEST_PORT,
        path: "/cost-calculator",
        method: "GET",
      });
      assert.strictEqual(res.statusCode, 308, `Expected status 308, got ${res.statusCode}`);
      assert.strictEqual(
        res.headers.location,
        "/cost-estimator",
        `Expected Location /cost-estimator, got ${res.headers.location}`
      );
    });

    await it("HTTP 308: GET /cost-calculator?area=2500&tier=luxury preserves query string", async () => {
      const res = await requestHttp({
        host: "127.0.0.1",
        port: TEST_PORT,
        path: "/cost-calculator?area=2500&tier=luxury",
        method: "GET",
      });
      assert.strictEqual(res.statusCode, 308, `Expected status 308, got ${res.statusCode}`);
      assert.strictEqual(
        res.headers.location,
        "/cost-estimator?area=2500&tier=luxury",
        `Expected Location /cost-estimator?area=2500&tier=luxury, got ${res.headers.location}`
      );
    });

    await it("HTTP 200: Destination route GET /cost-estimator responds with 200 OK", async () => {
      const res = await requestHttp({
        host: "127.0.0.1",
        port: TEST_PORT,
        path: "/cost-estimator",
        method: "GET",
      });
      assert.strictEqual(res.statusCode, 200, `Expected status 200, got ${res.statusCode}`);
    });

    await it("HTTP 308: GET /projects/projects-adani-gas-chamber-shinghpur redirects to canonical path", async () => {
      const res = await requestHttp({
        host: "127.0.0.1",
        port: TEST_PORT,
        path: "/projects/projects-adani-gas-chamber-shinghpur",
        method: "GET",
      });
      assert.strictEqual(res.statusCode, 308, `Expected status 308, got ${res.statusCode}`);
      assert.strictEqual(
        res.headers.location,
        "/projects/adani-gas-chamber-shinghpur",
        `Expected Location /projects/adani-gas-chamber-shinghpur, got ${res.headers.location}`
      );
    });

    await it("HTTP 308: GET /projects/projects-adani-gas-chamber-shinghpur?src=google preserves query string", async () => {
      const res = await requestHttp({
        host: "127.0.0.1",
        port: TEST_PORT,
        path: "/projects/projects-adani-gas-chamber-shinghpur?src=google&utm_medium=cpc",
        method: "GET",
      });
      assert.strictEqual(res.statusCode, 308, `Expected status 308, got ${res.statusCode}`);
      assert.strictEqual(
        res.headers.location,
        "/projects/adani-gas-chamber-shinghpur?src=google&utm_medium=cpc",
        `Expected Location with preserved query params, got ${res.headers.location}`
      );
    });

    await it("HTTP 308: GET /projects/expansion-of-weav-... redirects to canonical path", async () => {
      const res = await requestHttp({
        host: "127.0.0.1",
        port: TEST_PORT,
        path: "/projects/expansion-of-weav-projects-expansion-of-weaving-department-airjet-ajay-syntexing-department-airjet-ajay-syntex-pvt-ltd",
        method: "GET",
      });
      assert.strictEqual(res.statusCode, 308, `Expected status 308, got ${res.statusCode}`);
      assert.strictEqual(
        res.headers.location,
        "/projects/expansion-of-weaving-department-airjet-ajay-syntex-pvt-ltd",
        `Expected canonical Location, got ${res.headers.location}`
      );
    });
  } finally {
    if (process.platform === "win32") {
      try {
        spawn("taskkill", ["/pid", String(serverProc.pid), "/f", "/t"]);
      } catch {
        serverProc.kill("SIGKILL");
      }
    } else {
      serverProc.kill("SIGTERM");
    }
  }

  console.log("\n----------------------------------------------------------");
  console.log(`TOTAL REDIRECT TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("----------------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
