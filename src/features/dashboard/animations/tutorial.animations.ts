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

  // START infinite scrolling immediately
  if (backgroundLeft2) {
    const leftScroll = gsap.to(backgroundLeft2, {
      yPercent: -50,
      duration: 6,
      ease: "none",
      repeat: -1,
    });

    animations.push(leftScroll);

    // Only animate appearance
    tl.fromTo(
      backgroundLeft2,
      {
        opacity: 0,
        scale: 1.15,
        filter: "blur(30px) hue-rotate(20deg)",
      },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px) hue-rotate(0deg)",
        duration: 0.8,
      },
      0
    );
  }

  if (backgroundLeft6) {
    const leftScroll = gsap.to(backgroundLeft6, {
      yPercent: -50,
      duration: 6,
      ease: "none",
      repeat: -1,
    });

    animations.push(leftScroll);

    // Only animate appearance
    tl.fromTo(
      backgroundLeft6,
      {
        opacity: 0,
        scale: 1.15,
        filter: "blur(30px) hue-rotate(20deg)",
      },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px) hue-rotate(0deg)",
        duration: 0.8,
      },
      0
    );
  }

  if (backgroundRight2) {
    const rightScroll = gsap.to(backgroundRight2, {
      yPercent: 50,
      duration: 2,
      ease: "none",
      repeat: -1,
    });

    animations.push(rightScroll);

    // Only animate appearance
    tl.fromTo(
      backgroundRight2,
      {
        opacity: 0,
        scale: 1.15,
        filter: "blur(30px) hue-rotate(20deg)",
      },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px) hue-rotate(0deg)",
        duration: 0.8,
      },
      0
    );
  }

  if (backgroundRight6) {
    const rightScroll = gsap.to(backgroundRight6, {
      yPercent: 50,
      duration: 2,
      ease: "none",
      repeat: -1,
    });

    animations.push(rightScroll);

    // Only animate appearance
    tl.fromTo(
      backgroundRight6,
      {
        opacity: 0,
        scale: 1.15,
        filter: "blur(30px) hue-rotate(20deg)",
      },
      {
        opacity: 1,
        scale: 1,
        filter: "blur(0px) hue-rotate(0deg)",
        duration: 0.8,
      },
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
    tl.kill();
    tl.scrollTrigger?.kill();

    animations.forEach((animation) => animation.kill());
  };
}
