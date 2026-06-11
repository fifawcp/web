import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";

import type { TitleFavorite } from "../types/dashboard.types";

import { CardReveal } from "./CardReveal";

type Props = {
  favorites: TitleFavorite[];
  // Hide the in-card title when a surrounding section already provides a heading.
  showHeader?: boolean;
  className?: string;
  delay?: number;
  from?: "up" | "left" | "right";
};

// "Most picked to win" — the top champion picks across all players, with share bars.
export async function TitleFavoritesCard({ favorites, showHeader = true, className, delay, from }: Props) {
  const [t, locale] = await Promise.all([getTranslations("dashboard.favorites"), getLocale()]);

  if (favorites.length === 0) return null;

  // Show only the top 3 most-picked champions.
  const top = favorites.slice(0, 3);

  return (
    <CardReveal delay={delay} from={from} className={cn("opacity-0 gap-4 bg-card p-4 sm:p-5", className)}>
      {showHeader && (
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold">{t("title")}</h2>
          <span className="text-xs text-muted-foreground">{t("subtitle")}</span>
        </div>
      )}
      <ul className="flex flex-1 flex-col justify-center gap-4">
        {top.map((favorite, index) => (
          <li key={favorite.team.fifa_code} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                index === 0 ? "bg-page-accent text-white" : "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </span>
            <Image src={favorite.team.flag_url} alt="" width={32} height={22} sizes="32px" className="h-5 w-7 shrink-0 rounded-xs object-cover" />
            <span className="w-24 shrink-0 truncate text-sm font-semibold sm:w-28">{getTeamName(favorite.team, locale)}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-linear-to-r from-page-accent to-page-accent-strong" style={{ width: `${favorite.pick_percent}%` }} />
            </span>
            <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums">{favorite.pick_percent}%</span>
          </li>
        ))}
      </ul>
    </CardReveal>
  );
}
