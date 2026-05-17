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
  backgroundLeft2: gsap.DOMTarget | null;
  backgroundLeft6: gsap.DOMTarget | null;
  backgroundRight2: gsap.DOMTarget | null;
  backgroundRight6: gsap.DOMTarget | null;
};

export function tutorialSectionAnimation({
  container,
  title,
  subtitle,
  steps,
  cta,
  backgroundLeft2,
  backgroundLeft6,
  backgroundRight2,
  backgroundRight6,
}: TutorialAnimationProps) {
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

  // Decorative number panels — identical fade-in; only scroll direction & speed differ.
  const backgroundPanels = [
    { target: backgroundLeft2, yPercent: -50, duration: 6 },
    { target: backgroundLeft6, yPercent: -50, duration: 6 },
    { target: backgroundRight2, yPercent: 50, duration: 2 },
    { target: backgroundRight6, yPercent: 50, duration: 2 },
  ];

  for (const { target, yPercent, duration } of backgroundPanels) {
    if (!target) continue;

    // Infinite scroll loop, starts immediately.
    animations.push(gsap.to(target, { yPercent, duration, ease: "none", repeat: -1 }));

    // One-shot blur/scale reveal as the section enters the viewport.
    tl.fromTo(
      target,
      { opacity: 0, scale: 1.15, filter: "blur(30px) hue-rotate(20deg)" },
      { opacity: 1, scale: 1, filter: "blur(0px) hue-rotate(0deg)", duration: 0.8 },
      0
    );
  }

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
