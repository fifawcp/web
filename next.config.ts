import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
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
        { source: "/api/auth/otp/:path*", destination: `${upstream}/api/auth/otp/:path*` },
        { source: "/api/auth/logout/all", destination: `${upstream}/api/auth/logout/all` },
        { source: "/api/auth/sessions", destination: `${upstream}/api/auth/sessions` },
        { source: "/api/oauth/:path*", destination: `${upstream}/api/oauth/:path*` },
      ],

      // afterFiles: proxy non-auth API routes to the backend
      // Excludes paths owned by custom route handlers (e.g. matches/:id/pick, pickems/{groups,best-thirds,bracket}, boards/*, competitions/*) —
      // afterFiles rewrites run before dynamic routes, so a match here would swallow them
      afterFiles: [
        {
          source: "/api/:path((?!auth/|matches/[^/]+/pick|pickems/(?:groups|best-thirds|bracket)|boards(?:/.*)?|competitions(?:/.*)?).*)",
          destination: `${upstream}/api/:path*`,
        },
      ],

      fallback: [],
    };
  },
};

export default withNextIntl(nextConfig);
