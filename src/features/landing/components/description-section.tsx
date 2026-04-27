"use client";

import { useTranslations } from "next-intl";

import { FloatingShape } from "@shared/components/ui/floating-shape";
import { useScrollAnimation } from "@shared/hooks/useScrollAnimation";

import { DescriptionCard } from "./description-section-card";
import { cards, floatingShapes } from "./description-section-data";

export function DescriptionSection() {
  const t = useTranslations("home");
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section
      ref={ref}
      className="min-h-[calc(100dvh-var(--header-height))] relative flex items-center justify-center py-20 bg-linear-to-b from-white to-zinc-300 dark:from-zinc-950 dark:to-zinc-700 "
    >
      {floatingShapes.map((shape, index) => (
        <FloatingShape key={index} {...shape} />
      ))}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isVisible ? "animate-appear-from-bottom" : "opacity-0"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{t("howItWorks.title")}</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">{t("howItWorks.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card) => {
            const Icon = card.icon;
            return <DescriptionCard key={card.translationKey} card={card} Icon={Icon} isVisible={isVisible} />;
          })}
        </div>
      </div>
    </section>
  );
}
