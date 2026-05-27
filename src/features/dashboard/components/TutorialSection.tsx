import { TutorialMobile } from "./TutorialMobile";
import { TutorialScroller } from "./TutorialScroller";

/**
 * Tutorial section. Splits at md (≥768px):
 *   - Mobile: stacked card list with stagger reveal (`TutorialMobile`)
 *     which renders its own animated title.
 *   - Desktop: pinned scrollytelling stage (`TutorialScroller`) which
 *     renders the section title *inside* the pinned stage so it stays
 *     visible across every step transition.
 *
 * Both halves read steps from `lib/tutorialSteps.ts` so copy/imagery
 * stay in sync. Section-level `py-*` gives breathing room from the
 * dashboard above and the footer below. The `#tutorial` anchor lives
 * here so external links from elsewhere on the page land the user at
 * the same spot regardless of device.
 */
export function TutorialSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section id="tutorial" className="relative scroll-mt-(--tutorial-scroll-offset) border-t border-border bg-muted/30 py-12 md:py-16 lg:py-20 dark:bg-zinc-950">
      <TutorialScroller isLoggedIn={isLoggedIn} />
      <TutorialMobile isLoggedIn={isLoggedIn} />
    </section>
  );
}
