import { ArrowRight, Calendar1, Trophy, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/shared/components/ui/button";
import { BracketIcon } from "@/shared/icons/bracket-icon";
import { PodiumIcon } from "@/shared/icons/podium-icon";

type FeatureKey = "knockout" | "scores" | "compete";

const FEATURE_ICONS: Record<FeatureKey, LucideIcon | typeof BracketIcon> = {
  knockout: BracketIcon,
  scores: Calendar1,
  compete: PodiumIcon,
};

const FEATURES: FeatureKey[] = ["knockout", "scores", "compete"];

export async function AuthPanel() {
  const t = await getTranslations("auth.panel");

  return (
    <aside aria-label={t("brand")} className="relative hidden lg:flex h-full flex-col overflow-hidden bg-muted dark:bg-card">
      <div className="relative z-10 flex h-full flex-col p-10 xl:p-14">
        <div className="flex items-center gap-3 text-foreground">
          <Trophy className="size-10" aria-hidden="true" />
          <span className="text-xl xl:text-2xl font-bold tracking-tight">{t("brand")}</span>
        </div>

        <div className="my-auto flex flex-col gap-16">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-foreground">
                {t("headlineLine1")}
                <br />
                {t("headlineLine2")}
              </h1>
              <p className="max-w-md text-base text-muted-foreground leading-relaxed">{t("subtitle")}</p>
            </div>

            <Button asChild variant="ghost" className="self-start px-16 h-[44px] font-semibold bg-card dark:bg-muted shadow-none hover:bg-card/80 dark:hover:bg-muted/80">
              <Link href="/">
                {t("explore")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <ul className="flex flex-col gap-5">
            {FEATURES.map((key) => {
              const Icon = FEATURE_ICONS[key];

              return (
                <li key={key} className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-card text-foreground ring-1 ring-border dark:bg-muted">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-foreground">{t(`features.${key}.title`)}</p>
                    <p className="min-h-10 max-w-60 text-sm text-muted-foreground leading-snug">{t(`features.${key}.description`)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}
