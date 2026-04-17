"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@shared/components/ui/button";
import { FloatingShape } from "@shared/components/ui/floating-shape";
import { useScrollAnimation } from "@shared/hooks/useScrollAnimation";
import { FloatingShapeConfig } from "@shared/types/ui";

export function FinalSection() {
  const t = useTranslations("home");
  const { ref, isVisible } = useScrollAnimation(0.2);

  const floatingShapes: FloatingShapeConfig[] = [
    { color: "orange", size: 96, opacity: 70, darkOpacity: 30, position: { top: "5%", left: "25%" }, animation: "float", animationDelay: 0 },
    { color: "purple", size: 128, opacity: 70, darkOpacity: 30, position: { bottom: "5%", right: "25%" }, animation: "drift", animationDelay: 1.5 },
    { color: "red", shape: "diamond", size: 64, opacity: 70, darkOpacity: 30, position: { top: "50%", right: "2.5%" }, animation: "pulse", animationDelay: 0.8 },
    {
      color: "red",
      shape: "square",
      size: 80,
      opacity: 65,
      darkOpacity: 28,
      position: { top: "20%", right: "15%" },
      rotation: 15,
      animation: "rotate",
      animationDuration: 20,
    },
    { color: "purple", size: 72, opacity: 60, darkOpacity: 25, position: { bottom: "25%", left: "10%" }, animation: "wave", animationDelay: 1.2 },
    { color: "orange", shape: "diamond", size: 56, opacity: 68, darkOpacity: 26, position: { top: "35%", left: "5%" }, animation: "zigzag", animationDelay: 2 },
    {
      color: "purple",
      shape: "square",
      size: 64,
      opacity: 62,
      darkOpacity: 24,
      position: { bottom: "15%", right: "8%" },
      rotation: -20,
      animation: "bounce",
      animationDelay: 0.5,
    },
  ];

  return (
    <section
      ref={ref}
      className="min-h-[calc(100dvh-4rem)] flex items-center justify-center relative py-20 bg-linear-to-b from-zinc-300 to-white dark:from-zinc-700 dark:to-zinc-950"
    >
      {floatingShapes.map((shape, index) => (
        <FloatingShape key={index} {...shape} />
      ))}

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`max-w-3xl mx-auto text-center ${isVisible ? "animate-appear-from-bottom" : "opacity-0"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">{t("finalCta.title")}</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">{t("finalCta.subtitle")}</p>
          <Button asChild size="lg">
            <Link href="/register">{t("finalCta.button")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
