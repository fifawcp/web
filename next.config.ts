import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Self-contained server output for the Docker runtime image. See Dockerfile.
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "flagcdn.com", pathname: "/w320/**" }],
  },
  async rewrites() {
    const upstream = process.env.BACKEND_API_URL;
    if (!upstream) throw new Error("BACKEND_API_URL is required");

    return {
      // beforeFiles: run before Next.js file-system routing
      // /api/auth/token, /api/auth/token/refresh, and /api/auth/logout are omitted —
      // they have dedicated route handlers that manage the refresh-token cookie
      beforeFiles: [
        { source: "/api/auth/logout/all", destination: `${upstream}/api/auth/logout/all` },
        { source: "/api/auth/sessions", destination: `${upstream}/api/auth/sessions` },
        { source: "/api/auth/sessions/:id", destination: `${upstream}/api/auth/sessions/:id` },
        { source: "/api/oauth/:path((?!google).*)", destination: `${upstream}/api/oauth/:path*` },
      ],

      // Non-auth API routes are proxied by the catch-all route handler at
      // src/app/api/[...path]/route.ts (Node runtime), so it can attach the trusted
      // X-Client-IP header — a rewrite would drop proxy-set request headers.
      afterFiles: [],

      fallback: [],
    };
  },
};

export default withNextIntl(nextConfig);
