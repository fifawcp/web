"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { DEFAULT_DURATION, DEFAULT_EASE } from "@/shared/animations/constants";
import { fadeLeft, fadeRight, fadeUp } from "@/shared/animations/presets";
import { cn } from "@/shared/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type RevealFrom = "up" | "left" | "right" | "scale";

const FROM: Record<RevealFrom, gsap.TweenVars> = {
  up: fadeUp,
  left: fadeLeft,
  right: fadeRight,
  scale: { opacity: 0, scale: 0.96 },
};

type Props = {
  children: ReactNode;
  from?: RevealFrom;
  delay?: number;
  // When set, animate the wrapper's direct children with this stagger (for grids/lists).
  stagger?: number;
  // "scroll" (default) reveals as the element enters the viewport — best for long pages.
  // "mount" reveals immediately on mount with the delay, giving a coordinated entrance for
  // primary above-the-fold content that should reveal regardless of scroll position.
  trigger?: "scroll" | "mount";
  className?: string;
};

// Subtle reveal. Single mode fades/slides the wrapper in; stagger mode cascades its
// children. Scroll- or mount-triggered. Honours prefers-reduced-motion (shows, no motion).
export function Reveal({ children, from = "up", delay = 0, stagger, trigger = "scroll", className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isStagger = stagger != null;

  useGSAP(() => {
    const el = ref.current;
    if (!el) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const scrollTrigger = trigger === "scroll" ? { trigger: el, start: "top 85%", once: true } : undefined;

      if (isStagger) {
        const tween = gsap.from(el.children, {
          ...FROM[from],
          duration: DEFAULT_DURATION,
          ease: DEFAULT_EASE,
          delay,
          stagger,
          scrollTrigger,
        });
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      }

      const tween = gsap.fromTo(el, FROM[from], { opacity: 1, x: 0, y: 0, scale: 1, duration: DEFAULT_DURATION, ease: DEFAULT_EASE, delay, scrollTrigger });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    });

    // Reduced motion: reveal immediately with no transform.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(isStagger ? el.children : el, { opacity: 1, clearProps: "transform" });
    });

    return () => mm.revert();
  }, []);

  // Single mode hides the wrapper up-front (no flash); stagger items sit below the fold.
  return (
    <div ref={ref} className={cn(!isStagger && "opacity-0", className)}>
      {children}
    </div>
  );
}
