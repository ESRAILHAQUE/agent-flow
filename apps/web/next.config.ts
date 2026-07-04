import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker production builds
  output: "standalone",

  // Allow images from common external sources
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
      { protocol: "https", hostname: "res.cloudinary.com" },         // Cloudinary uploads
      { protocol: "https", hostname: "*.amazonaws.com" },            // AWS S3
    ],
  },
};

export default nextConfig;
