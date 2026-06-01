"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Hides its children on the auth screens (`/login`, `/register`, `/callback`)
 * at lg+ breakpoints. The desktop auth layout owns its own brand panel and
 * preferences cluster, so the global chrome (Header + Footer) would compete
 * for the same screen real estate.
 *
 * Mobile keeps both header and footer so the existing single-column auth
 * layout remains framed by the rest of the app.
 *
 * Lives as a tiny client wrapper because `usePathname` requires "use client",
 * but the actual `Header`/`Footer` underneath stay RSCs — they're passed in
 * as children and rendered unchanged.
 */
export function AuthRouteGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const isAuthRoute = /^\/[a-z]{2}(?:\/(?:login|register|callback)(?:\/|$))/.test(pathname) || /^\/(?:login|register|callback)(?:\/|$)/.test(pathname);

  if (!isAuthRoute) return <>{children}</>;
  return <div className="lg:hidden">{children}</div>;
}
