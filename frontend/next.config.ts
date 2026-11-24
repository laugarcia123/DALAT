import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo activar standalone cuando se construye con Docker
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" } : {}),

  // Redirigir llamadas de /api hacia el servidor FastAPI (Local o Producción en Render)
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
      "http://127.0.0.1:8000";

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
