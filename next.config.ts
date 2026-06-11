import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "apiv3.apifootball.com",
      },
    ],
  },
  async rewrites() {
    return [];
  },
};

export default nextConfig;
