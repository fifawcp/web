"use client";

import { Trophy } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

type Props = {
  champion: Team | null;
  className?: string;
};

export function BracketChampionCard({ champion, className }: Props) {
  const t = useTranslations("pickems.bracket");
  const locale = useLocale();

  if (!champion) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-card px-4 py-5">
          <span className="font-mono text-2xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">{t("champion")}</span>
          <p className="text-center text-xs text-muted-foreground">{t("pickFinalWinner")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 rounded-md border-2 bg-card px-4 py-6",
          "border-amber-400/70 dark:border-amber-500/50",
          "animate-in fade-in zoom-in-95 duration-500"
        )}
      >
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/15">
            <Trophy className="size-5 text-amber-600 dark:text-amber-400" strokeWidth={2.25} aria-hidden />
          </div>
          <span className="font-mono text-2xs font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-500">{t("champion")}</span>
        </div>

        <div className="flex w-full items-center justify-center gap-2.5">
          <div className="shrink-0 overflow-hidden rounded-xs ring-1 ring-border/60">
            <Image src={champion.flag_url} alt="" width={36} height={24} sizes="36px" className="h-6 w-9 object-cover" />
          </div>
          <span className="min-w-0 truncate text-lg font-semibold tracking-tight text-foreground">{getTeamName(champion, locale)}</span>
        </div>
      </div>
    </div>
  );
}
