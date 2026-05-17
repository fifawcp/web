import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { DEFAULT_DURATION, DEFAULT_EASE } from "@/shared/animations/constants";
import { fadeUp } from "@/shared/animations/presets";

gsap.registerPlugin(ScrollTrigger);

type CardAnimationProps = {
  card: gsap.DOMTarget;
};

// Shared fade-up reveal for dashboard cards (pick status, leaderboard).
export function cardFadeUpAnimation({ card }: CardAnimationProps) {
  const tl = gsap.timeline({
    defaults: {
      ease: DEFAULT_EASE,
    },
  });

  tl.fromTo(card, fadeUp, {
    opacity: 1,
    y: 0,
    duration: DEFAULT_DURATION * 1.5,
  });

  return () => {
    tl.kill();
    tl.scrollTrigger?.kill();
  };
}
