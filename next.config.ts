import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/admin/idebank": ["./docs/idebank.md"],
  },
};

export default nextConfig;
