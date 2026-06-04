import { ReactNode } from "react";
import Image from "next/image";

import { AuthPanel } from "@/features/auth/components/AuthPanel";
import { PreferencesToggles } from "@/shared/layout/PreferencesToggles";

// Auth screens read OAuth/step query params at request time (useSearchParams),
// so they can't be statically prerendered for each locale — render on demand.
export const dynamic = "force-dynamic";

/**
 * Two-faced auth chrome:
 *
 *  - Mobile (< lg): the existing single-column shell. The global Header is
 *    hidden via `AuthRouteGate` only at lg+, so mobile keeps the standard
 *    app chrome wrapping the form.
 *  - Desktop (lg+): split into a branded `AuthPanel` (left) and a clean
 *    form area (right). The stadium image and its overlay are rendered
 *    here — not inside `AuthPanel` — so the picture spans the *full*
 *    viewport and fades into `background` at the seam between the two
 *    columns. Pinning the image to a single column produced a hard
 *    vertical edge; bleeding it across the layout and letting one
 *    gradient handle the blend makes the transition feel like fog
 *    instead of a wall.
 *
 *  No `container` wrapper here on purpose: this view is a marketing-hero
 *  surface, not a content page. The panel and form both manage their
 *  own padding (`p-10`, `p-12`) so they breathe edge-to-edge.
 */
export default function AuthPagesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative bg-background lg:grid lg:min-h-dvh lg:grid-cols-2">
      {/* Full-bleed backdrop — only renders on lg+ where the split layout
          exists. The image sits behind both columns; the gradient on top
          carries it cleanly from "dark hero" on the left to `background`
          on the right (theme-aware, so it works in light and dark). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden lg:block">
        <Image src="/banner-stadium.webp" alt="" fill priority quality={100} sizes="100vw" className="object-cover object-center" />

        {/* Layer 1: Darken the left side for text contrast */}
        <div className="absolute inset-0 bg-linear-to-r from-zinc-950 via-zinc-950/10 via-40% to-transparent to-50%" />

        {/* Layer 2: Subtle top/bottom vignette */}
        <div className="absolute inset-0 bg-linear-to-b from-zinc-950/40 via-transparent to-zinc-950/50" />

        {/* Layer 3: Fade to background */}
        <div className="absolute inset-0 bg-linear-to-r from-background/0 from-30% via-background/20 dark:via-background/80 via-40% to-background to-50%" />

        {/* Layer 4: Extra light-mode fade - white overlay that softens the seam */}
        {/* <div className="absolute inset-0 bg-linear-to-r from-white/0  to-white to-50% dark:hidden" /> */}
      </div>

      <AuthPanel />

      <div className="relative flex min-h-[calc(100dvh-var(--header-height))] flex-col overflow-hidden bg-background lg:min-h-dvh lg:bg-transparent">
        <div className="relative z-10 flex flex-1 flex-col items-center justify-between px-4 py-[8vh] lg:p-10 gap-6">
          {/* Desktop-only preferences cluster — the global Header is hidden
              on auth routes at lg+, so theme/language need a home of their
              own. A theme toggle + language dropdown rather than the bundled
              popover, since there's room for both here. */}
          <div className="hidden w-full max-w-md justify-end lg:flex">
            <PreferencesToggles />
          </div>

          <div className="w-full max-w-md flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
