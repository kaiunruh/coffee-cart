import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['files.stripe.com'], // add any other domains your images come from here
  },
};

export default nextConfig;
