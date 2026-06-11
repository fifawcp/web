import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { DEFAULT_DURATION, DEFAULT_EASE } from "@/shared/animations/constants";
import { fadeLeft, fadeRight, fadeUp } from "@/shared/animations/presets";

gsap.registerPlugin(ScrollTrigger);

export type RevealFrom = "up" | "left" | "right";

const FROM: Record<RevealFrom, gsap.TweenVars> = {
  up: fadeUp,
  left: fadeLeft,
  right: fadeRight,
};

type CardAnimationProps = {
  card: gsap.DOMTarget;
  // Stagger offset so a group of cards reveals in sequence.
  delay?: number;
  // Direction the card slides in from.
  from?: RevealFrom;
};

// Shared mount reveal for dashboard cards. Honours prefers-reduced-motion.
export function cardFadeUpAnimation({ card, delay = 0, from = "up" }: CardAnimationProps) {
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const tl = gsap.timeline({ defaults: { ease: DEFAULT_EASE } });
    tl.fromTo(card, FROM[from], { opacity: 1, x: 0, y: 0, duration: DEFAULT_DURATION * 1.5, delay });
    return () => {
      tl.progress(1).kill();
      tl.scrollTrigger?.kill();
    };
  });

  // Reduced motion: reveal immediately with no transform.
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(card, { opacity: 1, clearProps: "transform" });
  });

  return () => mm.revert();
}
