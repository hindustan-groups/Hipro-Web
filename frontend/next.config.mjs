/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_API_URL || "https://hipro-web-1.onrender.com"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
