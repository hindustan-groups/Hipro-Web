   /** @type {import('next').NextConfig} */

let rawBackendUrl = process.env.BACKEND_API_URL || "https://hipro-web-1.onrender.com";

// Auto-heal malformed protocols (e.g. "https:hipro-web-1.onrender.com" -> "https://hipro-web-1.onrender.com")
if (rawBackendUrl.startsWith("https:") && !rawBackendUrl.startsWith("https://")) {
  rawBackendUrl = rawBackendUrl.replace(/^https:?\/*/, "https://");
} else if (rawBackendUrl.startsWith("http:") && !rawBackendUrl.startsWith("http://")) {
  rawBackendUrl = rawBackendUrl.replace(/^http:?\/*/, "http://");
} else if (!rawBackendUrl.startsWith("http://") && !rawBackendUrl.startsWith("https://")) {
  rawBackendUrl = `https://${rawBackendUrl}`;
}
rawBackendUrl = rawBackendUrl.replace(/\/+$/, "");

const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://i.pravatar.cc",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://hipro-web-1.onrender.com https://*.onrender.com https://res.cloudinary.com ws: wss: http://localhost:* http://127.0.0.1:*",
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
