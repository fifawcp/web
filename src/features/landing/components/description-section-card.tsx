import { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { CardConfig } from "@/features/types/landing.types";

export const DescriptionCard = ({ card, Icon, isVisible }: { card: CardConfig; Icon: LucideIcon; isVisible: boolean }) => {
  const t = useTranslations("home");
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
};
