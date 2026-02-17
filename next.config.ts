import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: "standalone",
  
  // Strict mode for better development experience
  reactStrictMode: true,
  
  // Image optimization configuration
  images: {
    // Add remote patterns if needed for external images
    remotePatterns: [],
  },
  
  // Experimental features (uncomment as needed)
  // experimental: {
  //   ppr: true, // Partial Pre-Rendering
  // },
};

export default nextConfig;
