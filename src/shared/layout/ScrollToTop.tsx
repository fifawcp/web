"use client";

import { useEffect } from "react";

import { usePathname } from "@/i18n/navigation";

// App Router's native scroll-to-top on navigation doesn't fire in this layout (the sticky-footer
// `flex` body isn't treated as the scroll target), so links navigate without resetting scroll.
// Reset the window scroll on every route change instead. Keyed on pathname only: search-param
// updates (filters, pagination via `router.replace(..., { scroll: false })`) and locale switches
// keep the same pathname and are left alone. Skips when a hash anchor is present so #-links work.
export function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
