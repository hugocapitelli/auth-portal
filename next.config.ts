import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@eximia/auth"],
};

export default nextConfig;
