"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

import { R32_SLOT_LABELS } from "../lib/bracketStructure";
import type { BracketMatchCompare, BracketMatchSlot } from "../types/pickems.types";

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
  /**
   * Read-only compare overlay. When present, the card is in compare mode: each
   * team row is tinted green when the user correctly predicted it to reach this
   * stage (per `homeCorrect` / `awayCorrect`), and the pick accent is dropped.
   * `undefined` in the normal pick flow.
   */
  comparison?: BracketMatchCompare | null;
  className?: string;
};

export function BracketMatchCard({ slot, density = "default", onPick, showId = false, disabled, topBar, comparison, className }: Props) {
  const tShort = useTranslations("pickems.bracket.roundsShort");
  const locale = useLocale();

  const pickedCode = slot.picked_team?.fifa_code;
  // Both contenders must be settled before the user can pick a winner —
  // otherwise picking the only-known side would commit a half-formed match.
  const bothTeamsKnown = Boolean(slot.home_team && slot.away_team);
  const canPick = !disabled && Boolean(onPick) && bothTeamsKnown;
  const interactive = Boolean(onPick);
  // Group-position hint for unresolved R32 slots on the read-only bracket
  // (e.g. "1E" / "3A/B/C/D/F"); undefined for later rounds + the pick flow.
  const slotLabels = R32_SLOT_LABELS[slot.match_id];

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
        interactive={interactive}
        placeholder={slotLabels?.home}
        compareCorrect={comparison ? comparison.homeCorrect : null}
        onPick={() => handleClick(slot.home_team)}
      />
      <div className="h-px bg-border" aria-hidden />
      <TeamRow
        team={slot.away_team}
        picked={pickedCode === slot.away_team?.fifa_code}
        density={density}
        locale={locale}
        canPick={canPick}
        interactive={interactive}
        placeholder={slotLabels?.away}
        compareCorrect={comparison ? comparison.awayCorrect : null}
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
  /** True in the pick flow (can choose a winner); false on the read-only bracket page. */
  interactive: boolean;
  /** Group-position hint for an unresolved read-only slot (e.g. "1E"); shown instead of "to be decided". */
  placeholder?: string;
  /** `null` = not in compare mode; `true/false` = green when correctly predicted. */
  compareCorrect: boolean | null;
  onPick: () => void;
};

function TeamRow({ team, picked, density, locale, canPick, interactive, placeholder, compareCorrect, onPick }: TeamRowProps) {
  const t = useTranslations("pickems.bracket");

  if (!team) {
    // Pick flow → "Pick winner". Read-only bracket → the group-position slot
    // label (e.g. "1E" / "3A/B/C/D/F") when known, else "to be decided".
    const label = interactive ? t("pickWinner") : (placeholder ?? t("toBeDecided"));
    return (
      <div className={cn("flex items-center gap-2 px-2.5 text-muted-foreground", density === "dense" ? "py-1.5 text-xs" : "py-2.5 text-sm")}>
        <span className="size-3 shrink-0 rounded-full border border-dashed border-muted-foreground/60" aria-hidden />
        <span className={cn(placeholder && !interactive ? "font-mono text-2xs tracking-wide" : "italic")}>{label}</span>
      </div>
    );
  }

  const inCompare = compareCorrect !== null;
  const correct = compareCorrect === true;
  // Compare mode greens correctly-predicted advancers and ignores the pick
  // accent; the normal pick flow keeps the accent + check on the chosen winner.
  const highlighted = inCompare ? correct : picked;

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={!canPick}
      className={cn(
        "group flex w-full items-center gap-1 px-2.5 text-left transition-colors",
        density === "dense" ? "py-1.5" : "py-2.5",
        canPick ? "cursor-pointer" : "cursor-default",
        inCompare ? correct && "bg-lime-500/15" : picked && "bg-page-accent-soft",
        canPick && !highlighted && "hover:bg-muted"
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
      <span
        className={cn(
          "min-w-0 flex-1 truncate",
          density === "dense" ? "text-xs" : "text-sm",
          highlighted ? "font-semibold" : "font-medium",
          inCompare && correct ? "text-lime-700 dark:text-lime-400" : "text-foreground"
        )}
      >
        {getTeamName(team, locale)}
      </span>
      {inCompare
        ? correct && <Check className={cn("shrink-0 text-lime-600 dark:text-lime-400", density === "dense" ? "size-3" : "size-3.5")} aria-hidden />
        : picked && <Check className={cn("shrink-0 text-page-accent-strong", density === "dense" ? "size-3" : "size-3.5")} aria-hidden />}
    </button>
  );
}
