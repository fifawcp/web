import gsap from "gsap";

import { DEFAULT_EASE } from "@/shared/animations/constants";

type StaggerRevealProps = {
  // Elements animated in DOM order — typically `[data-reveal]` descendants.
  items: gsap.DOMTarget;
  step?: number;
  duration?: number;
  y?: number;
};

// Quick staggered fade-up fired once on mount. GSAP sets the hidden start state so
// content still renders without JS (no `opacity-0` in markup). Honours reduced motion.
export function staggerReveal({ items, step = 0.06, duration = 0.4, y = 14 }: StaggerRevealProps) {
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const tween = gsap.fromTo(items, { opacity: 0, y }, { opacity: 1, y: 0, duration, ease: DEFAULT_EASE, stagger: step });
    return () => {
      tween.progress(1).kill();
    };
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(items, { opacity: 1, clearProps: "transform" });
  });

  return () => mm.revert();
}
