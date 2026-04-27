import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const guestOnlyRoutes = ["/", "/login", "/register", "/auth/callback"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Guest-only routes - redirect authenticated users to /home
    if (token && token.access_token && guestOnlyRoutes.includes(path)) {
      return NextResponse.redirect(new URL("/home", req.url));
    }

    // Protected routes - check for valid token
    if (!guestOnlyRoutes.includes(path)) {
      if (!token || !token.access_token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      if (token.expires_at) {
        const expiresAt = new Date(token.expires_at as string).getTime();
        if (Date.now() > expiresAt) {
          return NextResponse.redirect(new URL("/login", req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Allow guest routes and verify route without token
        if (guestOnlyRoutes.includes(path)) {
          return true;
        }

        // Protected routes require token with backend access_token
        return !!token && !!token.access_token;
      },
    },
  }
);

export const config = {
  matcher: ["/", "/home/:path*", "/login", "/register", "/auth/callback"],
};
