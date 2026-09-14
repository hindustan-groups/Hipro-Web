import express from "express";
import cookieParser from "cookie-parser";
import http from "http";
import authRouter from "../routes/auth";
import contactRouter from "../routes/contact";
import quoteRouter from "../routes/quote";

// Setup test app with trust proxy enabled
const app = express();
app.set("trust proxy", 1);
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/contact", contactRouter);
app.use("/api/quote", quoteRouter);

async function runRateLimitTests() {
  console.log("==================================================");
  console.log("       API RATE LIMITING REGRESSION SUITE         ");
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
    // ----------------------------------------------------
    // TEST 1: POST /api/auth/login Rate Limiting (5 / 15 min / IP)
    // ----------------------------------------------------
    console.log("--- Testing POST /api/auth/login ---");
    const loginIp = "192.0.2.1"; // TEST-NET-1 IP
    let loginResponses: { status: number; data: any; headers: Headers }[] = [];

    for (let i = 1; i <= 6; i++) {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": `${loginIp}`,
        },
        body: JSON.stringify({ email: "random@test.com", password: "wrongpassword123" }),
      });
      const data = await res.json();
      loginResponses.push({ status: res.status, data, headers: res.headers });
    }

    // Requests 1-5 should NOT be 429
    assert(
      loginResponses.slice(0, 5).every((r) => r.status !== 429),
      "First 5 login attempts are allowed through to validation (not 429)"
    );
    assert(
      loginResponses[0].headers.get("RateLimit-Limit") === "5",
      "Login endpoint sets RateLimit-Limit header: 5"
    );
    assert(
      loginResponses[0].headers.get("RateLimit-Remaining") === "4",
      "Login endpoint correctly computes RateLimit-Remaining: 4 on request 1"
    );

    // Request 6 MUST be 429
    const loginBlocked = loginResponses[5];
    assert(
      loginBlocked.status === 429,
      "6th login attempt receives HTTP 429 Too Many Requests"
    );
    assert(
      loginBlocked.data?.success === false &&
      loginBlocked.data?.error?.includes("Too many login attempts"),
      "429 response contains safe message without exposing account existence"
    );
    assert(
      Number(loginBlocked.headers.get("Retry-After")) > 0,
      "429 response includes valid positive integer Retry-After header"
    );
    assert(
      loginBlocked.headers.get("RateLimit-Remaining") === "0",
      "429 response sets RateLimit-Remaining to 0"
    );

    // ----------------------------------------------------
    // TEST 2: POST /api/contact Rate Limiting (5 / 15 min / IP)
    // ----------------------------------------------------
    console.log("\n--- Testing POST /api/contact ---");
    const contactIp = "192.0.2.2";
    let contactResponses: { status: number; data: any; headers: Headers }[] = [];

    for (let i = 1; i <= 6; i++) {
      const res = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": `${contactIp}`,
        },
        body: JSON.stringify({ name: "Spam Bot", email: "invalid", message: "spam" }),
      });
      const data = await res.json();
      contactResponses.push({ status: res.status, data, headers: res.headers });
    }

    assert(
      contactResponses.slice(0, 5).every((r) => r.status !== 429),
      "First 5 contact requests are allowed through to validation (not 429)"
    );
    assert(
      contactResponses[5].status === 429,
      "6th contact submission from same IP receives HTTP 429 Too Many Requests"
    );
    assert(
      contactResponses[5].data?.error?.includes("Too many contact submissions"),
      "Contact 429 response contains safe error message"
    );
    assert(
      Number(contactResponses[5].headers.get("Retry-After")) > 0,
      "Contact 429 response includes Retry-After header"
    );

    // ----------------------------------------------------
    // TEST 3: POST /api/quote Rate Limiting (5 / 15 min / IP)
    // ----------------------------------------------------
    console.log("\n--- Testing POST /api/quote ---");
    const quoteIp = "192.0.2.3";
    let quoteResponses: { status: number; data: any; headers: Headers }[] = [];

    for (let i = 1; i <= 6; i++) {
      const res = await fetch(`${baseUrl}/api/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": `${quoteIp}`,
        },
        body: JSON.stringify({ name: "Flooder", email: "flood@test.com" }),
      });
      const data = await res.json();
      quoteResponses.push({ status: res.status, data, headers: res.headers });
    }

    assert(
      quoteResponses.slice(0, 5).every((r) => r.status !== 429),
      "First 5 quote requests are allowed through to validation (not 429)"
    );
    assert(
      quoteResponses[5].status === 429,
      "6th quote submission from same IP receives HTTP 429 Too Many Requests"
    );
    assert(
      quoteResponses[5].data?.error?.includes("Too many quote requests"),
      "Quote 429 response contains safe error message"
    );
    assert(
      Number(quoteResponses[5].headers.get("Retry-After")) > 0,
      "Quote 429 response includes Retry-After header"
    );

    // ----------------------------------------------------
    // TEST 4: Endpoint Isolation
    // ----------------------------------------------------
    console.log("\n--- Testing Endpoint & IP Isolation ---");
    // An IP blocked on contact should NOT be blocked on quote if not exceeded
    const isolatedIp = "192.0.2.4";
    // Hit contact 5 times on isolatedIp
    for (let i = 0; i < 5; i++) {
      await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": isolatedIp },
        body: JSON.stringify({}),
      });
    }
    // Contact 6th is blocked
    const contactBlocked = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": isolatedIp },
      body: JSON.stringify({}),
    });
    assert(contactBlocked.status === 429, "Contact is blocked for isolated IP");

    // But quote for same isolatedIp is NOT blocked yet!
    const quoteAllowed = await fetch(`${baseUrl}/api/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": isolatedIp },
      body: JSON.stringify({}),
    });
    assert(
      quoteAllowed.status !== 429,
      "Reaching contact rate limit does not cross-contaminate quote endpoint"
    );

    // And a different IP for contact is NOT blocked
    const freshIpContact = await fetch(`${baseUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Forwarded-For": "192.0.2.99" },
      body: JSON.stringify({}),
    });
    assert(
      freshIpContact.status !== 429,
      "Different client IP has an independent rate-limit window"
    );

  } finally {
    server.close();
  }

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runRateLimitTests().catch((e) => {
  console.error("Test suite error:", e);
  process.exit(1);
});
