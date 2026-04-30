import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
    },
  },
};

export default nextConfig;
