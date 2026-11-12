import express from "express";
import http from "http";
import automailRouter from "../routes/automail";
import assert from "assert";

async function verifyAuth() {
  const app = express();
  app.use(express.json());
  app.use("/api/automail", automailRouter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/automail/contacts/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Connection": "close" },
      body: JSON.stringify({}),
    });

    console.log("Unauthenticated POST /api/automail/contacts/import status:", res.status);
    assert.strictEqual(res.status, 401, "Expected HTTP 401 Unauthorized");
    console.log("[PASS] Automail import route strictly requires authentication!");
  } finally {
    server.close();
    process.exit(0);
  }
}

verifyAuth().catch(err => {
  console.error("[FAIL] Auth verification failed:", err);
  process.exit(1);
});
