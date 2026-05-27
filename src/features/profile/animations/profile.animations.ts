import gsap from "gsap";

import { DEFAULT_EASE } from "@/shared/animations/constants";

// Profile has fewer top-level sections than Standings (~6 instead of 14), so
// the per-item delay can stay tight and the duration can be the same — the
// whole reveal lands in ~0.55 s, snappy without feeling abrupt.
const STAGGER_STEP = 0.05;
const ITEM_DURATION = 0.35;

type ProfileRevealProps = {
  /** DOM targets animated in document order (identity → stats → progress → boards/prefs → account). */
  items: gsap.DOMTarget;
};

/**
 * Fast stagger reveal mirroring the standings pattern. Each section fades up a
 * few pixels with a short cascade — keeps the page feeling alive after the
 * skeleton swap without distracting from the data.
 *
 * No `opacity-0` in the markup: GSAP sets the hidden start state on mount so
 * the page still renders without JS.
 */
export function profileRevealAnimation({ items }: ProfileRevealProps) {
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
