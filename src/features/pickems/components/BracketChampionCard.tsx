"use client";

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

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        className={cn(
          "flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border-2 bg-card px-4 py-5",
          champion ? "border-page-accent" : "border-dashed border-border"
        )}
      >
        <span className={cn("font-mono text-2xs font-semibold uppercase tracking-[0.2em]", champion ? "text-page-accent-strong" : "text-muted-foreground/70")}>
          {t("champion")}
        </span>
        {champion ? (
          <div className="flex w-full items-center justify-center gap-2.5">
            <div className="shrink-0 overflow-hidden rounded-xs ring-1 ring-border/60">
              <Image src={champion.flag_url} alt="" width={36} height={24} sizes="36px" className="h-6 w-9 object-cover" />
            </div>
            <span className="min-w-0 truncate text-base font-semibold text-foreground">{getTeamName(champion, locale)}</span>
          </div>
        ) : (
          <p className="text-center text-xs text-muted-foreground">{t("pickFinalWinner")}</p>
        )}
      </div>
    </div>
  );
}
