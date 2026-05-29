"use client";

import { useState } from "react";
import { Lock, Pencil, Plus, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { AWARD_CONFIG, playerCountry } from "../lib/awards";
import type { AwardType, Player, ResolvedAwardPick } from "../types/awards.types";

import { PlayerFlagAvatar } from "./PlayerFlagAvatar";
import { PlayerPicker } from "./PlayerPicker";

type Props = {
  awardType: AwardType;
  pick: ResolvedAwardPick | undefined;
  isLocked: boolean;
  onSelect: (player: Player) => void;
  onClear: () => void;
};

/**
 * One award slot — tall card matching the design reference. Three states:
 *   - filled (editable): big flag avatar, player name, and a divided footer
 *     of country / position / club; Change + remove controls.
 *   - filled (locked): same, read-only, with a "locked in" chip.
 *   - empty: a dashed target that opens the picker.
 *
 * Each award carries its own accent tint (`AWARD_CONFIG`) so the four cards
 * read as a colorful, balanced set rather than four identical tiles.
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
      {/* Header — icon chip + title/subtitle, Change on the right when filled. */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
            <Icon className="size-4.5" />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold leading-tight">{tTypes(`${awardType}.title`)}</span>
            <span className="text-xs leading-snug text-muted-foreground">{tTypes(`${awardType}.description`)}</span>
          </div>
        </div>
        {player && !isLocked && (
          <Button variant="ghost" size="sm" className="-mr-1.5 -mt-1 h-7 shrink-0 gap-1 px-1.5 text-xs text-muted-foreground" onClick={() => setPickerOpen(true)}>
            <Pencil className="size-3" />
            {t("card.change")}
          </Button>
        )}
      </div>

      {player ? (
        <div className="flex flex-1 flex-col">
          {/* Hero: avatar + name + status. */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 py-3 text-center">
            <PlayerFlagAvatar player={player} size={72} className="ring-2 ring-page-accent/50" />
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold leading-tight">{player.name}</span>
              {isLocked ? (
                <span className="inline-flex items-center justify-center gap-1 text-2xs font-medium uppercase tracking-wide text-muted-foreground">
                  <Lock className="size-3" />
                  {t("card.lockedIn")}
                </span>
              ) : (
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
          </div>

          {/* Footer: country / position / club, divided. */}
          <div className="grid grid-cols-3 divide-x divide-border rounded-lg bg-muted/50 text-center">
            <FooterCell label={playerCountry(player, locale)} />
            <FooterCell label={tPositions(player.position)} />
            <FooterCell label={player.club?.name ?? "—"} />
          </div>
        </div>
      ) : isLocked ? (
        <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/50 py-10 text-sm text-muted-foreground">{t("card.noPick")}</div>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-10 text-sm font-medium text-muted-foreground transition-colors",
            "hover:border-page-accent hover:bg-page-accent-soft/40 hover:text-page-accent-strong"
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-muted">
            <Plus className="size-5" />
          </span>
          {t("card.pick")}
        </button>
      )}

      {!isLocked && <PlayerPicker awardType={awardType} open={pickerOpen} onOpenChange={setPickerOpen} selectedPlayerId={player?.id} onSelect={onSelect} />}
    </div>
  );
}

function FooterCell({ label }: { label: string }) {
  return <span className="truncate px-2 py-2 text-2xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>;
}
