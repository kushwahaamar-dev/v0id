import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["polkadot-api", "@polkadot-api/smoldot"],
  turbopack: {},
};

export default nextConfig;
