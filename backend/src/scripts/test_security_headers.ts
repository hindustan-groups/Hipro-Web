import express from "express";
import http from "http";
import { securityHeaders } from "../middleware/securityHeaders";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(securityHeaders);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Security headers test" });
});

app.post("/api/test-post", (req, res) => {
  res.status(201).json({ created: true });
});

async function runSecurityHeaderTests() {
  console.log("==================================================");
  console.log("      API SECURITY HEADERS REGRESSION SUITE       ");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const endpoints = [
      { path: "/health", method: "GET" },
      { path: "/api/test", method: "GET" },
      { path: "/api/test-post", method: "POST" },
      { path: "/api/non-existent-route", method: "GET" },
    ];

    for (const ep of endpoints) {
      console.log(`--- Testing ${ep.method} ${ep.path} ---`);
      const res = await fetch(`${baseUrl}${ep.path}`, { method: ep.method });

      // 1. X-Content-Type-Options
      assert(
        res.headers.get("x-content-type-options") === "nosniff",
        `X-Content-Type-Options is nosniff on ${ep.path}`,
        `Got: ${res.headers.get("x-content-type-options")}`
      );

      // 2. X-Frame-Options
      assert(
        res.headers.get("x-frame-options") === "DENY",
        `X-Frame-Options is DENY on ${ep.path}`,
        `Got: ${res.headers.get("x-frame-options")}`
      );

      // 3. Content-Security-Policy
      const csp = res.headers.get("content-security-policy");
      assert(
        Boolean(csp && csp.includes("default-src 'none'")),
        `CSP restricts scripts on ${ep.path}`,
        `Got: ${csp}`
      );

      // 4. Strict-Transport-Security
      const hsts = res.headers.get("strict-transport-security");
      assert(
        Boolean(hsts && hsts.includes("max-age=63072000") && hsts.includes("includeSubDomains") && hsts.includes("preload")),
        `HSTS is properly configured with preload on ${ep.path}`,
        `Got: ${hsts}`
      );

      // 5. Referrer-Policy
      assert(
        res.headers.get("referrer-policy") === "strict-origin-when-cross-origin",
        `Referrer-Policy is strict-origin-when-cross-origin on ${ep.path}`,
        `Got: ${res.headers.get("referrer-policy")}`
      );

      // 6. Permissions-Policy
      const permPolicy = res.headers.get("permissions-policy");
      assert(
        Boolean(permPolicy && permPolicy.includes("camera=()") && permPolicy.includes("microphone=()")),
        `Permissions-Policy blocks sensitive APIs on ${ep.path}`,
        `Got: ${permPolicy}`
      );

      // 7. Cross-Origin-Resource-Policy
      assert(
        res.headers.get("cross-origin-resource-policy") === "cross-origin",
        `Cross-Origin-Resource-Policy is cross-origin on ${ep.path}`,
        `Got: ${res.headers.get("cross-origin-resource-policy")}`
      );

      // 8. X-Powered-By header is removed
      assert(
        res.headers.get("x-powered-by") === null,
        `X-Powered-By is absent on ${ep.path}`,
        `Got: ${res.headers.get("x-powered-by")}`
      );
    }

    console.log("\n==================================================");
    console.log(`RESULTS: ${passed} passed, ${failed} failed`);
    console.log("==================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runSecurityHeaderTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
