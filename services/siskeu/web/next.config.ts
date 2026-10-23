import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    const internalApi = process.env.INTERNAL_API_URL || "http://127.0.0.1:3001";
    const authApi = process.env.AUTH_INTERNAL_API_URL || process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";
    return [
      { source: "/api/auth/:path*", destination: `${authApi}/api/auth/:path*` },
      { source: "/api/:path((?!auth/).*)", destination: `${internalApi}/api/:path*` },
    ];
  },
};

export default nextConfig;
