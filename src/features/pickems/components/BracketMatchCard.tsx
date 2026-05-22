"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

import type { BracketMatchSlot } from "../types/pickems.types";

type Density = "default" | "dense";

type Props = {
  slot: BracketMatchSlot;
  density?: Density;
  onPick?: (fifaCode: string) => void;
  /** Minimalist "#73" tag at the top of the card — opt-in for mobile. */
  showId?: boolean;
  disabled?: boolean;
  /** Rendered as the first row inside the card — used by center cards for the ornament bar. */
  topBar?: React.ReactNode;
  className?: string;
};

export function BracketMatchCard({ slot, density = "default", onPick, showId = false, disabled, topBar, className }: Props) {
  const tShort = useTranslations("pickems.bracket.roundsShort");
  const locale = useLocale();

  const pickedCode = slot.picked_team?.fifa_code;
  // Both contenders must be settled before the user can pick a winner —
  // otherwise picking the only-known side would commit a half-formed match.
  const bothTeamsKnown = Boolean(slot.home_team && slot.away_team);
  const canPick = !disabled && Boolean(onPick) && bothTeamsKnown;

  const handleClick = (team: Team | null) => {
    if (!canPick || !team) return;
    onPick?.(team.fifa_code);
  };

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-md border bg-card", className)}>
      {topBar}
      {showId && (
        <div className="flex items-center justify-between border-b border-border px-3 py-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>{tShort(slot.stage_code)}</span>
          <span>M{slot.match_id}</span>
        </div>
      )}

      <TeamRow
        team={slot.home_team}
        picked={pickedCode === slot.home_team?.fifa_code}
        density={density}
        locale={locale}
        canPick={canPick}
        onPick={() => handleClick(slot.home_team)}
      />
      <div className="h-px bg-border" aria-hidden />
      <TeamRow
        team={slot.away_team}
        picked={pickedCode === slot.away_team?.fifa_code}
        density={density}
        locale={locale}
        canPick={canPick}
        onPick={() => handleClick(slot.away_team)}
      />
    </div>
  );
}

type TeamRowProps = {
  team: Team | null;
  picked: boolean;
  density: Density;
  locale: string;
  canPick: boolean;
  onPick: () => void;
};

function TeamRow({ team, picked, density, locale, canPick, onPick }: TeamRowProps) {
  const t = useTranslations("pickems.bracket");

  if (!team) {
    return (
      <div className={cn("flex items-center gap-2 px-2.5 italic text-muted-foreground", density === "dense" ? "py-1.5 text-xs" : "py-2.5 text-sm")}>
        <span className="size-3 shrink-0 rounded-full border border-dashed border-muted-foreground/60" aria-hidden />
        <span>{t("pickWinner")}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={!canPick}
      className={cn(
        "group flex w-full items-center gap-1 px-2.5 text-left transition-colors",
        density === "dense" ? "py-1.5" : "py-2.5",
        canPick ? "cursor-pointer" : "cursor-default",
        picked && "bg-page-accent-soft",
        canPick && !picked && "hover:bg-muted"
      )}
      aria-pressed={picked}
    >
      <div className="shrink-0 overflow-hidden rounded-xs ring-1 ring-border/60">
        {density === "dense" ? (
          <Image src={team.flag_url} alt="" width={20} height={14} sizes="20px" className="h-3.5 w-5 object-cover" />
        ) : (
          <Image src={team.flag_url} alt="" width={32} height={20} sizes="32px" className="h-5 w-8 object-cover" />
        )}
      </div>
      <span className={cn("min-w-0 flex-1 truncate text-foreground", density === "dense" ? "text-xs" : "text-sm", picked ? "font-semibold" : "font-medium")}>
        {getTeamName(team, locale)}
      </span>
      {picked && <Check className={cn("shrink-0 text-page-accent-strong", density === "dense" ? "size-3" : "size-3.5")} aria-hidden />}
    </button>
  );
}
