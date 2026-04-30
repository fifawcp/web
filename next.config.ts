import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
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

      // afterFiles: proxy all non-auth API routes (boards, users, etc.) after
      // Next.js has confirmed there is no matching page or API route handler.
      afterFiles: [{ source: "/api/:path((?!auth/).*)", destination: `${upstream}/api/:path*` }],

      fallback: [],
    };
  },
};

export default withNextIntl(nextConfig);
