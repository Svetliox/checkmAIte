import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  reactStrictMode: true,

  images: {
    remotePatterns: [],
  },
  
  // Experimental features (uncomment as needed)
  // experimental: {
  //   ppr: true, // Partial Pre-Rendering
  // },
};

export default nextConfig;
