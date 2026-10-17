import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    const apiUrl = process.env.INTERNAL_API_URL || "http://127.0.0.1:3001";
    return [
      {
        source: "/api/:path((?!auth(?:/|$)).*)",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
