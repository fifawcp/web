"use client";

import { useTranslations } from "next-intl";
import { Target, Users, Award, UserPlus, Lock, Trophy, LucideIcon } from "lucide-react";
import { FloatingShape } from "@shared/components/ui/floating-shape";
import { useScrollAnimation } from "@shared/hooks/useScrollAnimation";
import { FloatingShapeConfig } from "@shared/types/ui";

type CardConfig = {
  icon: LucideIcon;
  translationKey: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientDark: string;
  delay: number;
};

export function DescriptionSection() {
  const t = useTranslations("home");
  const { ref, isVisible } = useScrollAnimation(0.2);

  const cards: CardConfig[] = [
    {
      icon: Target,
      translationKey: "pickScores",
      borderColor: "border-wc-red/30 dark:border-zinc-800 hover:border-wc-red dark:hover:border-wc-red",
      gradientFrom: "from-wc-red/50 to-wc-red",
      gradientTo: "dark:from-wc-red/20 dark:via-wc-orange/30 dark:to-wc-purple/50",
      gradientDark: "",
      delay: 0,
    },
    {
      icon: Award,
      translationKey: "earnPoints",
      borderColor: "border-wc-orange/30 dark:border-zinc-800 hover:border-wc-orange dark:hover:border-wc-orange",
      gradientFrom: "from-wc-orange/50 to-wc-orange",
      gradientTo: "dark:from-wc-orange/20 dark:via-wc-purple/30 dark:to-wc-red/50",
      gradientDark: "",
      delay: 150,
    },
    {
      icon: Users,
      translationKey: "compete",
      borderColor: "border-wc-purple/30 dark:border-zinc-800 hover:border-wc-purple dark:hover:border-wc-purple",
      gradientFrom: "from-wc-purple/50 to-wc-purple",
      gradientTo: "dark:from-wc-purple/20 dark:via-wc-red/30 dark:to-wc-orange/50",
      gradientDark: "",
      delay: 300,
    },
    {
      icon: UserPlus,
      translationKey: "joinLeague",
      borderColor: "border-wc-red/30 dark:border-zinc-800 hover:border-wc-red dark:hover:border-wc-red",
      gradientFrom: "from-wc-red/50 to-wc-red",
      gradientTo: "dark:from-wc-red/20 dark:via-wc-orange/30 dark:to-wc-purple/50",
      gradientDark: "",
      delay: 450,
    },
    {
      icon: Lock,
      translationKey: "matchLock",
      borderColor: "border-wc-orange/30 dark:border-zinc-800 hover:border-wc-orange dark:hover:border-wc-orange",
      gradientFrom: "from-wc-orange/50 to-wc-orange",
      gradientTo: "dark:from-wc-orange/20 dark:via-wc-purple/30 dark:to-wc-red/50",
      gradientDark: "",
      delay: 600,
    },
    {
      icon: Trophy,
      translationKey: "masterTheBracket",
      borderColor: "border-wc-purple/30 dark:border-zinc-800 hover:border-wc-purple dark:hover:border-wc-purple",
      gradientFrom: "from-wc-purple/50 to-wc-purple",
      gradientTo: "dark:from-wc-purple/20 dark:via-wc-red/30 dark:to-wc-orange/50",
      gradientDark: "",
      delay: 750,
    },
  ];

  const floatingShapes: FloatingShapeConfig[] = [
    {
      color: "purple",
      shape: "square",
      size: 80,
      opacity: 70,
      darkOpacity: 30,
      blur: "none",
      position: { top: "10%", right: "5%" },
      rotation: 12,
      animation: "rotate",
      animationDuration: 15,
    },
    { color: "purple", size: 64, opacity: 70, darkOpacity: 30, blur: "none", position: { bottom: "15%", left: "25%" }, animation: "bounce", animationDelay: 0.5 },
    {
      color: "orange",
      shape: "diamond",
      size: 48,
      opacity: 70,
      darkOpacity: 30,
      blur: "none",
      position: { top: "50%", right: "25%" },
      animation: "zigzag",
      animationDelay: 1,
    },
    {
      color: "red",
      shape: "diamond",
      size: 56,
      opacity: 70,
      darkOpacity: 30,
      blur: "none",
      position: { bottom: "33%", left: "33%" },
      animation: "wave",
      animationDelay: 2,
    },
    { color: "orange", size: 72, opacity: 60, darkOpacity: 25, blur: "none", position: { top: "20%", left: "10%" }, animation: "float", animationDelay: 0.3 },
    {
      color: "red",
      shape: "square",
      size: 64,
      opacity: 65,
      darkOpacity: 28,
      blur: "none",
      position: { bottom: "20%", right: "8%" },
      rotation: 25,
      animation: "drift",
      animationDelay: 1.8,
    },
    {
      color: "purple",
      shape: "diamond",
      size: 52,
      opacity: 55,
      darkOpacity: 22,
      blur: "none",
      position: { top: "70%", left: "15%" },
      animation: "pulse",
      animationDelay: 2.5,
    },
  ];

  return (
    <section
      ref={ref}
      className="min-h-[calc(100dvh-4rem)] relative flex items-center justify-center py-20 bg-linear-to-b from-white to-zinc-300 dark:from-zinc-950 dark:to-zinc-700 "
    >
      {/* Decorative shapes for How It Works section */}
      {floatingShapes.map((shape, index) => (
        <FloatingShape key={index} {...shape} />
      ))}
      {/* End of decorative shapes for How It Works section */}

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isVisible ? "animate-appear-from-bottom" : "opacity-0"}`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">{t("howItWorks.title")}</h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">{t("howItWorks.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.translationKey}
                className={`flex flex-col items-center text-center p-6 rounded-xl bg-white dark:bg-zinc-900 border-2 ${card.borderColor} transition-all hover:shadow-lg shadow-sm opacity-0 ${isVisible ? "animate-appear-from-bottom" : ""}`}
                style={{ animationDelay: `${card.delay}ms` }}
              >
                <div className={`flex items-center justify-center mb-4 shadow-md w-14 h-14 rounded-full bg-linear-to-br ${card.gradientFrom} ${card.gradientTo}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">{t(`howItWorks.steps.${card.translationKey}.title`)}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{t(`howItWorks.steps.${card.translationKey}.description`)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
