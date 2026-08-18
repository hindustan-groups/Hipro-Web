/**
 * Keep-Alive Service for Free Cloud Tiers (Render, Railway, Glitch)
 * 
 * Free tier hosting instances go to sleep after 15 minutes of inactivity.
 * This service automatically pings the server's health endpoint every 10 minutes
 * to ensure 24/7 uptime and zero cold-start delay for users.
 */

export function startKeepAlive() {
  if (process.env.DISABLE_KEEP_ALIVE === "true") {
    console.log("[Keep-Alive] Disabled by DISABLE_KEEP_ALIVE env variable.");
    return;
  }

  // Detect host URL from common hosting platforms or environment variables
  let hostUrl = 
    process.env.KEEP_ALIVE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.RAILWAY_STATIC_URL ? `https://${process.env.RAILWAY_STATIC_URL}` : null) ||
    (process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null) ||
    process.env.SERVER_URL ||
    process.env.BACKEND_URL ||
    process.env.API_URL;

  // If in production without explicit URL, inform the user
  if (!hostUrl) {
    if (process.env.NODE_ENV === "production") {
      console.log(
        "[Keep-Alive] Running in production. Set KEEP_ALIVE_URL or SERVER_URL (e.g. https://your-app.onrender.com) to enable auto-pinging."
      );
    }
    return;
  }

  // Ensure url has protocol
  if (!hostUrl.startsWith("http://") && !hostUrl.startsWith("https://")) {
    hostUrl = `https://${hostUrl}`;
  }

  const pingUrl = `${hostUrl.replace(/\/$/, "")}/api/health`;
  const INTERVAL_MS = parseInt(process.env.KEEP_ALIVE_INTERVAL_MS || "600000", 10); // 10 minutes (600,000 ms)

  console.log(`[Keep-Alive] 🚀 Keep-Alive service activated! Pinging ${pingUrl} every ${INTERVAL_MS / 60000} minutes.`);

  // Initial ping after 30 seconds
  setTimeout(() => {
    pingServer(pingUrl);
  }, 30000);

  // Set recurring interval
  setInterval(() => {
    pingServer(pingUrl);
  }, INTERVAL_MS);
}

async function pingServer(url: string) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "Render-Railway-KeepAlive/1.0" },
      signal: AbortSignal.timeout(15000) // 15s timeout
    });

    if (res.ok) {
      console.log(`[Keep-Alive] 💓 Ping successful to ${url} [${res.status} ${res.statusText}] at ${new Date().toLocaleTimeString()}`);
    } else {
      console.warn(`[Keep-Alive] ⚠️ Ping returned status ${res.status} from ${url}`);
    }
  } catch (err: any) {
    console.error(`[Keep-Alive] ❌ Ping failed: ${err.message}`);
  }
}
