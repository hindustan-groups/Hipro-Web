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
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
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
