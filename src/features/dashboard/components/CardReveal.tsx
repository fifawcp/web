"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";

import { Card } from "@/shared/components/ui/card";

import { cardFadeUpAnimation, type RevealFrom } from "../animations/card.animations";

type Props = {
  children: ReactNode;
  className?: string;
  // Stagger offset (seconds) so grouped cards reveal in sequence.
  delay?: number;
  // Direction the card slides in from (default "up").
  from?: RevealFrom;
  // Render a plain <div> instead of a <Card> so non-card elements (e.g. the slim
  // banner) can share the same mount reveal and stay in harmony with the stagger.
  bare?: boolean;
};

// Thin client wrapper that owns the GSAP mount reveal so the wrapped content can
// stay a server component. GSAP's `fromTo` sets the hidden start state on mount,
// then animates in (callers add `opacity-0` to avoid a flash).
export function CardReveal({ children, className, delay, from, bare }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;
    return cardFadeUpAnimation({ card: cardRef.current, delay, from });
  }, []);

  if (bare) {
    return (
      <div ref={cardRef} className={className}>
        {children}
      </div>
    );
  }

  return (
    <Card ref={cardRef} size="sm" className={className}>
      {children}
    </Card>
  );
}
