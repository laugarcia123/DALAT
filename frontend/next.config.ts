import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo activar standalone cuando se construye con Docker
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),
};

export default nextConfig;
