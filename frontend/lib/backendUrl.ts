/**
 * Backend URL Resolver with Fail-Closed Safety Guard
 *
 * Resolution rules (SEC-HIGH-03 / Phase 2C-1O):
 *   - In production (NODE_ENV === "production"):
 *       Falls back to the Render backend URL if BACKEND_API_URL is not set.
 *   - In ALL other environments (development, test, staging, unset NODE_ENV):
 *       Throws a fatal configuration error — never falls back to live Render.
 *       This prevents test suites, local dev, and staging from silently
 *       targeting the production backend.
 *
 * Staging policy (F-01 / Phase 2C-1O):
 *   No dedicated staging backend has been provisioned or approved for this
 *   repository. Staging therefore follows the same fail-closed loopback-only
 *   policy as development and test. If a dedicated staging backend is ever
 *   provisioned, its hostname must be explicitly approved via a separate
 *   security review before any staging exception is added to this file.
 *
 * Legacy-host detection (F-02 / Phase 2C-1O):
 *   The old "hipro-web-1.onrender.com" domain check is performed AFTER full
 *   URL parsing so that only the exact parsed hostname is matched. Pre-parse
 *   substring matches (url.includes(...)) are not used; they can be triggered
 *   by crafted path or query components in an unrelated URL.
 *
 * Note: BACKEND_API_URL is a server-side environment variable; it is never
 * exposed to the browser bundle. Client components must use NEXT_PUBLIC_API_URL.
 */

/** Safe loopback hostnames (case-insensitive). */
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export function getBackendUrl(): string {
  let rawUrl = process.env.BACKEND_API_URL;
  const env = process.env.NODE_ENV ?? "";

  // -- Step 0: Missing URL --------------------------------------------------
  if (!rawUrl || rawUrl.trim() === "") {
    if (env === "production") {
      // Production: allow the Render fallback for backward compatibility until
      // Vercel environment variables are formally validated.
      rawUrl = "https://hipro-backend-749v.onrender.com";
    } else {
      // Development, test, staging, or unset: fail closed.
      // Do NOT fall back to live Render -- fail immediately with a clear message.
      throw new Error(
        `[FATAL CONFIG ERROR] BACKEND_API_URL is missing in "${env || "unset"}" mode! ` +
        `Refusing to fall back to the live production backend (Render). ` +
        `Please define BACKEND_API_URL=http://localhost:5000 in your ` +
        `frontend/.env.local file (for development) or ` +
        `frontend/.env.test.local (for tests).`
      );
    }
  }

  let url = rawUrl.trim();

  // -- Step 1: Strict scheme requirement ------------------------------------
  // Must explicitly begin with http:// or https://. No auto-repair.
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    throw new Error(
      `[FATAL CONFIG ERROR] BACKEND_API_URL ("${rawUrl}") must begin with an explicit "http://" or "https://" scheme. ` +
      `Ambiguous schemes, protocol-relative URLs, and typos are rejected.`
    );
  }

  // -- Step 2: Parse and validate URL structure -----------------------------
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch (err: any) {
    throw new Error(
      `[FATAL CONFIG ERROR] Malformed BACKEND_API_URL ("${rawUrl}"): ${err.message}`
    );
  }

  // -- Step 3: Reject embedded credentials (username / password) ------------
  if (parsed.username || parsed.password) {
    throw new Error(
      `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain embedded user credentials.`
    );
  }

  // -- Step 4: Reject query strings -----------------------------------------
  if (parsed.search && parsed.search !== "") {
    throw new Error(
      `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain query strings ("${parsed.search}").`
    );
  }

  // -- Step 5: Reject URL fragments / hash ----------------------------------
  if (parsed.hash && parsed.hash !== "") {
    throw new Error(
      `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain URL fragments ("${parsed.hash}").`
    );
  }

  // -- Step 6: Reject subpath prefixes --------------------------------------
  if (parsed.pathname !== "/" && parsed.pathname !== "") {
    throw new Error(
      `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain a path prefix ("${parsed.pathname}"). ` +
      `The base URL must be the root origin (e.g. "http://localhost:5000") as callers automatically append "/api/...".`
    );
  }

  // -- Step 7: Legacy hostname check (post-parse, exact hostname match) -----
  // F-02: do NOT use url.includes() -- that fires on path/query/fragment content.
  // Only the exact parsed hostname "hipro-web-1.onrender.com" is matched here.
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === "hipro-web-1.onrender.com") {
    if (env === "production") {
      // Production only: auto-heal the old suspended Render domain.
      return "https://hipro-backend-749v.onrender.com";
    } else {
      throw new Error(
        `[FATAL CONFIG ERROR] Legacy Render backend URL ("hipro-web-1.onrender.com") detected in "${env || "unset"}" mode! ` +
        `Refusing to auto-heal to live Render backend. Please configure a local backend URL (http://localhost:5000).`
      );
    }
  }

  // -- Step 8: Loopback-only policy in all non-production environments ------
  // F-01: staging no longer receives an unconditional remote-host exemption.
  // No dedicated staging backend has been provisioned; staging follows the
  // same loopback-only rule as development and test.
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

export const BACKEND_URL = getBackendUrl();