   /** @type {import('next').NextConfig} */

/**
 * next.config.mjs — Backend URL Validation (Phase 2C-1O)
 *
 * Staging policy (F-01): No dedicated staging backend is provisioned.
 * Staging follows the same loopback-only policy as development and test.
 *
 * Legacy-host detection (F-02): Checked post-parse via exact hostname
 * comparison; pre-parse url.includes() is not used.
 */

let rawBackendUrl = process.env.BACKEND_API_URL;
const env = process.env.NODE_ENV ?? "";

// -- Step 0: Missing URL ----------------------------------------------------
if (!rawBackendUrl || rawBackendUrl.trim() === "") {
  if (env === "production") {
    // Production: allow the Render fallback for backward compatibility until
    // Vercel environment variables are formally validated.
    rawBackendUrl = "https://hipro-backend-749v.onrender.com";
  } else {
    // Development, test, staging, or unset: fail closed.
    throw new Error(
      `[FATAL CONFIG ERROR] BACKEND_API_URL is missing in "${env || "unset"}" mode! ` +
      `Refusing to fall back to live production backend (Render). ` +
      `Please define BACKEND_API_URL=http://localhost:5000 in your frontend/.env.local file.`
    );
  }
}

let url = rawBackendUrl.trim();

// -- Step 1: Strict scheme requirement --------------------------------------
if (!url.startsWith("http://") && !url.startsWith("https://")) {
  throw new Error(
    `[FATAL CONFIG ERROR] BACKEND_API_URL ("${rawBackendUrl}") must begin with an explicit "http://" or "https://" scheme. ` +
    `Ambiguous schemes, protocol-relative URLs, and typos are rejected.`
  );
}

// -- Step 2: Parse and validate URL structure --------------------------------
let parsed;
try {
  parsed = new URL(url);
} catch (err) {
  throw new Error(
    `[FATAL CONFIG ERROR] Malformed BACKEND_API_URL ("${rawBackendUrl}"): ${err.message}`
  );
}

// -- Step 3: Reject embedded credentials ------------------------------------
if (parsed.username || parsed.password) {
  throw new Error(
    `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain embedded user credentials.`
  );
}

// -- Step 4: Reject query strings -------------------------------------------
if (parsed.search && parsed.search !== "") {
  throw new Error(
    `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain query strings ("${parsed.search}").`
  );
}

// -- Step 5: Reject URL fragments / hash ------------------------------------
if (parsed.hash && parsed.hash !== "") {
  throw new Error(
    `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain URL fragments ("${parsed.hash}").`
  );
}

// -- Step 6: Reject subpath prefixes ----------------------------------------
if (parsed.pathname !== "/" && parsed.pathname !== "") {
  throw new Error(
    `[FATAL CONFIG ERROR] BACKEND_API_URL must not contain a path prefix ("${parsed.pathname}"). ` +
    `The base URL must be the root origin (e.g. "http://localhost:5000") as callers automatically append "/api/...".`
  );
}

// -- Step 7: Legacy hostname check (post-parse, exact hostname match) --------
// F-02: url.includes() is NOT used -- it would match crafted path/query content.
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const hostname = parsed.hostname.toLowerCase();

if (hostname === "hipro-web-1.onrender.com") {
  if (env === "production") {
    // Production only: auto-heal the old suspended Render domain.
    url = "https://hipro-backend-749v.onrender.com";
    // Re-parse so Step 8 sees the canonical production hostname.
    parsed = new URL(url);
  } else {
    throw new Error(
      `[FATAL CONFIG ERROR] Legacy Render backend URL ("hipro-web-1.onrender.com") detected in "${env || "unset"}" mode! ` +
      `Refusing to auto-heal to live Render backend. Please configure a local backend URL (http://localhost:5000).`
    );
  }
}

// -- Step 8: Loopback-only policy in all non-production environments ---------
// F-01: staging no longer receives an unconditional remote-host exemption.
// No dedicated staging backend has been provisioned; staging follows the
// same loopback-only rule as development and test.
const finalHostname = parsed.hostname.toLowerCase();
if (env !== "production") {
  if (!LOOPBACK_HOSTS.has(finalHostname)) {
    throw new Error(
      `[FATAL CONFIG ERROR] Non-local backend host ("${finalHostname}") is blocked in "${env || "unset"}" mode! ` +
      `Only loopback hosts (localhost, 127.0.0.1, [::1]) are permitted in non-production environments. ` +
      `If a dedicated staging backend is required, its hostname must be approved via a separate security review.`
    );
  }
}

rawBackendUrl = url.replace(/\/+$/, "");

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://i.pravatar.cc https://www.google-analytics.com https://*.google-analytics.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://hipro-backend-749v.onrender.com https://*.onrender.com https://res.cloudinary.com https://www.google-analytics.com https://analytics.google.com https://*.google-analytics.com ws: wss: http://localhost:* http://127.0.0.1:*",
  "frame-src 'self' https://maps.google.com https://www.google.com",
  "frame-ancestors 'self'",
  "media-src 'self' https://res.cloudinary.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: cspDirectives },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${rawBackendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;