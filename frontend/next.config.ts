import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo activar standalone cuando se construye con Docker
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),

  // Redirigir llamadas de /api hacia el servidor FastAPI local (útil para port-forwarding de VS Code)
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
