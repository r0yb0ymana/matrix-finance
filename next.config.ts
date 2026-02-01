import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration
  turbopack: {},

  // External packages for server components (keeps them server-side only)
  serverExternalPackages: ['pg', 'pg-native'],
};

export default nextConfig;
