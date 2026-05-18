import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { DEFAULT_DURATION, DEFAULT_EASE, DEFAULT_SCROLL_TRIGGER, DEFAULT_STAGGER } from "@/shared/animations/constants";
import { fadeLeft, fadeUp, fadeUpLarge } from "@/shared/animations/presets";

gsap.registerPlugin(ScrollTrigger);

type TutorialAnimationProps = {
  container: HTMLElement;
  title: gsap.DOMTarget;
  subtitle: gsap.DOMTarget;
  steps: gsap.DOMTarget;
  cta: gsap.DOMTarget | null;
};

export function tutorialSectionAnimation({ container, title, subtitle, steps, cta }: TutorialAnimationProps) {
  const animations: gsap.core.Animation[] = [];

  const tl = gsap.timeline({
    defaults: {
      ease: DEFAULT_EASE,
    },
    scrollTrigger: {
      trigger: container,
      ...DEFAULT_SCROLL_TRIGGER,
    },
  });

  tl.fromTo(
    title,
    fadeUpLarge,
    {
      opacity: 1,
      y: 0,
      duration: DEFAULT_DURATION,
    },
    "-=0.5"
  )
    .fromTo(
      subtitle,
      fadeUp,
      {
        opacity: 1,
        y: 0,
        duration: DEFAULT_DURATION,
      },
      "-=0.4"
    )
    .fromTo(
      steps,
      fadeLeft,
      {
        opacity: 1,
        x: 0,
        duration: 0.5,
        stagger: DEFAULT_STAGGER,
      },
      "-=0.2"
    );

  if (cta) {
    tl.fromTo(
      cta,
      fadeUp,
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
      },
      "-=0.1"
    );
  }

  return () => {
    tl.progress(1).kill();
    tl.scrollTrigger?.kill();

    animations.forEach((animation) => animation.kill());
  };
}
