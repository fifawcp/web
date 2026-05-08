import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "flagcdn.com", pathname: "/w320/**" }],
  },
  async rewrites() {
    const upstream = process.env.BACKEND_API_URL;
    if (!upstream) throw new Error("BACKEND_API_URL is required");

    return {
      // beforeFiles: proxy specific backend auth paths BEFORE Next.js resolves the
      // [...nextauth] catch-all. This ensures otp/logout calls reach the API,
      // while NextAuth's own session/signin/callback routes are left untouched.
      //
      // /api/auth/token and /api/auth/token/refresh are intentionally omitted here —
      // they are handled by dedicated route handlers that re-set the refresh-token
      // cookie with path="/" so the middleware can read it on all routes.
      beforeFiles: [
        { source: "/api/auth/otp/:path*", destination: `${upstream}/api/auth/otp/:path*` },
        { source: "/api/auth/logout/all", destination: `${upstream}/api/auth/logout/all` },
        { source: "/api/auth/logout", destination: `${upstream}/api/auth/logout` },
        { source: "/api/auth/sessions", destination: `${upstream}/api/auth/sessions` },
        { source: "/api/oauth/:path*", destination: `${upstream}/api/oauth/:path*` },
      ],

      // afterFiles: proxy non-auth API routes to the backend.
      // Excludes paths owned by custom route handlers (e.g. matches/:id/pick) —
      // afterFiles rewrites run before dynamic routes, so a match here would swallow them
      afterFiles: [{ source: "/api/:path((?!auth/|matches/[^/]+/pick).*)", destination: `${upstream}/api/:path*` }],

      fallback: [],
    };
  },
};

export default withNextIntl(nextConfig);
