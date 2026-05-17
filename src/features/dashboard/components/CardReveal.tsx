"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";

import { Card } from "@/shared/components/ui/card";

import { cardFadeUpAnimation } from "../animations/card.animations";

type Props = {
  children: ReactNode;
  className?: string;
};

// Thin client wrapper that owns the GSAP mount reveal so the wrapped content can
// stay a server component. No `opacity-0` in markup: the card renders visible
// without JS; GSAP's `fromTo` sets the hidden start state on mount, then animates in.
export function CardReveal({ children, className }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;
    return cardFadeUpAnimation({ card: cardRef.current });
  }, []);

  return (
    <Card ref={cardRef} size="sm" className={className}>
      {children}
    </Card>
  );
}
