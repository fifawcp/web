import gsap from "gsap";

import { DEFAULT_EASE } from "@/shared/animations/constants";

// Standings has a lot of cards (12 groups + thirds card + optional legend),
// so the per-item delay is tighter than DEFAULT_STAGGER and the duration is
// shorter — the whole reveal should feel like a quick cascade, not a wave.
const STAGGER_STEP = 0.04;
const ITEM_DURATION = 0.35;

type StandingsRevealProps = {
  /** Items animated in order: legend (if visible), group cards, thirds card. */
  items: gsap.DOMTarget;
};

/**
 * Fast stagger reveal that fires once on mount after the skeleton swaps for
 * the real content. Each item fades up a few pixels with a short delay
 * between them, producing a quick cascade that gives the page a sense of
 * arriving rather than popping in all at once.
 *
 * No `opacity-0` in the markup: GSAP sets the hidden start state on mount so
 * the page still renders without JS.
 */
export function standingsRevealAnimation({ items }: StandingsRevealProps) {
  const tween = gsap.fromTo(
    items,
    { opacity: 0, y: 12 },
    {
      opacity: 1,
      y: 0,
      duration: ITEM_DURATION,
      ease: DEFAULT_EASE,
      stagger: STAGGER_STEP,
    }
  );

  return () => {
    tween.progress(1).kill();
  };
}
