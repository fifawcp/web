"use client";

import { useState } from "react";
import { CheckCircle2, Lock, Pencil, Plus, Shield, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { AWARD_CONFIG, playerCountry, positionChipClasses } from "../lib/awards";
import type { AwardType, Player, ResolvedAwardPick } from "../types/awards.types";

import { PlayerFlag } from "./PlayerFlag";
import { PlayerPicker } from "./PlayerPicker";

type Props = {
  awardType: AwardType;
  pick: ResolvedAwardPick | undefined;
  isLocked: boolean;
  onSelect: (player: Player) => void;
  onClear: () => void;
};

/**
 * One award slot with three states (filled+editable, filled+locked, empty). The
 * body below the header is a fixed height so the card doesn't resize between
 * states or when a pick is added/removed.
 */
export function AwardCard({ awardType, pick, isLocked, onSelect, onClear }: Props) {
  const t = useTranslations("awards");
  const tTypes = useTranslations("awards.types");
  const tPositions = useTranslations("awards.picker.positions");
  const locale = useLocale();
  const [pickerOpen, setPickerOpen] = useState(false);

  const { icon: Icon } = AWARD_CONFIG[awardType];
  const player = pick?.player;

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
            <Icon className="size-4.5" />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold leading-tight">{tTypes(`${awardType}.title`)}</span>
            {/* Reserve two lines so cards with a longer description (e.g. Young
                Player) keep the same header height and their bodies stay aligned. */}
            <span className="line-clamp-2 min-h-8 text-xs text-muted-foreground">{tTypes(`${awardType}.description`)}</span>
          </div>
        </div>
        {player && !isLocked && (
          <Button
            variant="outline"
            size="sm"
            className="-mr-1 -mt-0.5 h-7 shrink-0 gap-1 border-page-accent/50 px-2 text-xs text-page-accent-strong hover:bg-page-accent-soft hover:text-page-accent-strong"
            onClick={() => setPickerOpen(true)}
          >
            <Pencil className="size-3" />
            {t("card.change")}
          </Button>
        )}
      </div>

      <div className="flex h-64 flex-col gap-3">
        {player ? (
          <>
            {/* Hero: status pill, flag on a dotted accent halo, name, remove. */}
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide",
                  isLocked ? "bg-muted text-muted-foreground" : "bg-page-accent-soft text-page-accent-strong"
                )}
              >
                {isLocked ? <Lock className="size-3" /> : <CheckCircle2 className="size-3" />}
                {isLocked ? t("card.lockedIn") : t("card.active")}
              </span>

              <div className="relative flex items-center justify-center py-0.5">
                <FlagHalo />
                <PlayerFlag player={player} size={64} shape="circle" className="relative" />
              </div>

              <span className="text-base font-bold leading-tight">{player.name}</span>

              {!isLocked && (
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center justify-center gap-1 text-2xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-destructive"
                >
                  <X className="size-3" />
                  {t("card.remove")}
                </button>
              )}
            </div>

            {/* Meta — country + colored position split the width; club spans below. */}
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-1.5">
                <span className="flex flex-1 items-center justify-center truncate rounded-md bg-muted px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {playerCountry(player, locale)}
                </span>
                <span
                  className={cn(
                    "flex flex-1 items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wide",
                    positionChipClasses(player.position)
                  )}
                >
                  {tPositions(player.position)}
                </span>
              </div>
              {player.club?.name && (
                <span className="flex items-center justify-center gap-1.5 rounded-md bg-muted px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  <Shield className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{player.club.name}</span>
                </span>
              )}
            </div>
          </>
        ) : isLocked ? (
          <div className="flex h-full items-center justify-center rounded-lg bg-muted/50 text-sm text-muted-foreground">{t("card.noPick")}</div>
        ) : (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className={cn(
              "flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground transition-colors",
              "hover:border-page-accent hover:bg-page-accent-soft/40 hover:text-page-accent-strong"
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Plus className="size-5" />
            </span>
            {t("card.pick")}
          </button>
        )}
      </div>

      {!isLocked && <PlayerPicker awardType={awardType} open={pickerOpen} onOpenChange={setPickerOpen} selectedPlayerId={player?.id} onSelect={onSelect} />}
    </div>
  );
}

/** Dotted accent halo + soft glow sitting behind the chosen player's flag. */
function FlagHalo() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span className="absolute size-20 rounded-full bg-page-accent/10 blur-2xl" />
      <span
        className="absolute size-28 text-page-accent"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1.6px)",
          backgroundSize: "9px 9px",
          opacity: 0.22,
          WebkitMaskImage: "radial-gradient(circle, #000 34%, transparent 70%)",
          maskImage: "radial-gradient(circle, #000 34%, transparent 70%)",
        }}
      />
    </span>
  );
}
