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
