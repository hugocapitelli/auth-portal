import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@eximia/auth"],
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
