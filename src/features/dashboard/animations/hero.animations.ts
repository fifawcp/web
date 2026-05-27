import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { DEFAULT_DURATION, DEFAULT_EASE, DEFAULT_SCROLL_TRIGGER } from "@/shared/animations/constants";
import { fadeUp } from "@/shared/animations/presets";

gsap.registerPlugin(ScrollTrigger);

type HeroAnimationProps = {
  container: HTMLElement;
  card: gsap.DOMTarget;
  background: gsap.DOMTarget | null;
};

export function heroSectionAnimation({ container, card, background }: HeroAnimationProps) {
  const tl = gsap.timeline({
    defaults: {
      ease: DEFAULT_EASE,
    },
    scrollTrigger: {
      trigger: container,
      ...DEFAULT_SCROLL_TRIGGER,
    },
  });

  // Animate background image first (desktop only)
  if (background) {
    tl.fromTo(
      background,
      {
        opacity: 0,
        scale: 1.2,
        filter: "blur(20px)",
      },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(10px)",
        duration: DEFAULT_DURATION * 1.5,
        onComplete: () => {
          gsap.fromTo(
            background,
            {
              scale: 1,
            },
            {
              scale: 0.8,
              duration: DEFAULT_DURATION * 5,
            }
          );
        },
      }
    );
  }

  // Animate hero card
  tl.fromTo(
    card,
    fadeUp,
    {
      opacity: 1,
      y: 0,
      duration: DEFAULT_DURATION * 1.2,
    },
    background ? "-=0.6" : "0"
  );

  return () => {
    tl.progress(1).kill();
    tl.scrollTrigger?.kill();
  };
}
