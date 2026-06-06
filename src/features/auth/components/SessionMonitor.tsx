"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { isTokenStale } from "@/shared/lib/api/jwt";
import { refreshBackendAccessToken } from "@/shared/lib/api/refresh";

// Paths where an unauthenticated session is expected -> no redirect should fire.
// Mirror proxy.ts PUBLIC_ROUTES + GUEST_ONLY_ROUTES.
const GUEST_PATHS = new Set(["/", "/schedule", "/standings", "/bracket", "/login", "/register", "/callback", "/how-it-works", "/rules", "/privacy", "/terms", "/faq"]);

function isGuestPath(pathname: string): boolean {
  return GUEST_PATHS.has(pathname) || pathname.startsWith("/boards/join/");
}

// SessionMonitor covers one specific gap: the user stays on the same page long
// enough for the access token to expire without any navigation occurring
//
// It does NOT poll. It fires only on tab focus, and only when the token is
// actually stale, so under normal usage it produces zero network requests
//
// Refresh flow on tab focus with a stale token:
//   visibilitychange
//     → POST /api/auth/token/refresh   (single network call, deduplicated
//                                       across all open tabs via Web Locks)
//     → update(newToken)               (writes the new access_token into
//                                       the NextAuth session in-memory)
//
// Page navigations are handled separately by the middleware (proxy.ts), which
// refreshes server-side before the RSC renders, so this component only needs
// to cover the single-page idle case
export function SessionMonitor() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect to login when the NextAuth session expires (JWT maxAge reached or
  // signOut called). Skip guest pages to avoid a redirect loop.
  useEffect(() => {
    if (status !== "unauthenticated") return;
    if (isGuestPath(pathname)) return;

    router.replace("/login");
  }, [status, pathname, router]);

  useEffect(() => {
    const accessToken = session?.access_token;
    if (!accessToken) return;

    const onVisibilityChange = async () => {
      if (document.visibilityState !== "visible") return;
      if (!isTokenStale(accessToken)) return;

      // If the token is stale, refresh it
      const res = await refreshBackendAccessToken();
      if (res.success && res.data) await update(res.data);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [session?.access_token, update]);

  return null;
}
