"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Command, CommandItem, CommandList } from "@/shared/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

import { usePlayerSearch } from "../hooks/usePlayerSearch";
import { AWARD_CONFIG, PLAYER_POSITIONS, playerCountry } from "../lib/awards";
import type { AwardType, Player, PlayerPosition } from "../types/awards.types";

import { PlayerFlagAvatar } from "./PlayerFlagAvatar";

type Props = {
  awardType: AwardType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Currently-picked player for this slot, if any (highlighted in the list). */
  selectedPlayerId?: number;
  onSelect: (player: Player) => void;
};

/**
 * Searchable player picker. The body is mounted only while `open` so each open
 * starts with fresh filter state and — crucially — closing unmounts it
 * immediately. Previously we reset the query in `onOpenChange` *while still
 * open*, which for position-locked awards (Golden Glove) kicked off a fresh
 * players request on the way out and made the close feel laggy. Unmounting on
 * close cancels any in-flight search and makes the dialog dismiss instantly.
 */
export function PlayerPicker({ awardType, open, onOpenChange, selectedPlayerId, onSelect }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        {open && (
          <PlayerPickerBody
            awardType={awardType}
            selectedPlayerId={selectedPlayerId}
            onSelect={(player) => {
              onSelect(player);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PlayerPickerBody({ awardType, selectedPlayerId, onSelect }: { awardType: AwardType; selectedPlayerId?: number; onSelect: (player: Player) => void }) {
  const t = useTranslations("awards.picker");
  const tTypes = useTranslations("awards.types");
  const locale = useLocale();

  const { lockedPosition, maxAge } = AWARD_CONFIG[awardType];

  const [query, setQuery] = useState("");
  const [positions, setPositions] = useState<PlayerPosition[]>([]);

  // A position-locked award (Golden Glove) always constrains to its position,
  // regardless of the toggle row (which is hidden in that case).
  const activePositions = lockedPosition ? [lockedPosition] : positions;

  const { data, isFetching, isIdle, error } = usePlayerSearch({ q: query, positions: activePositions, enabled: true });

  // The API has no age filter, so enforce the Young Player U21 rule client-side
  // — otherwise the user could pick an over-age player and the save would 400
  // ("player is not eligible for this award").
  const players = (data?.players ?? []).filter((p) => (maxAge ? p.age <= maxAge : true));
  const hasMore = data?.hasMore ?? false;

  const description = maxAge ? t("descriptionAge", { age: maxAge }) : lockedPosition ? t("descriptionLocked") : t("description");

  function togglePosition(pos: PlayerPosition) {
    setPositions((prev) => (prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]));
  }

  return (
    <>
      <DialogHeader className="gap-1 border-b border-border p-4">
        <DialogTitle>{t("title", { award: tTypes(`${awardType}.title`) })}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <Command shouldFilter={false} className="rounded-none bg-transparent">
        {/* Search input — controlled, debounced inside the hook. */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label={t("searchPlaceholder")}
          />
          {isFetching && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />}
        </div>

        {/* Position filter — hidden for position-locked awards. */}
        {!lockedPosition && (
          <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2.5">
            {PLAYER_POSITIONS.map((pos) => {
              const active = positions.includes(pos);
              return (
                <button
                  key={pos}
                  type="button"
                  onClick={() => togglePosition(pos)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                    active ? "border-page-accent bg-page-accent-soft text-page-accent-strong" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {t(`positions.${pos}`)}
                </button>
              );
            })}
          </div>
        )}

        <CommandList className="max-h-80">
          {isIdle ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t("idle")}</p>
          ) : error ? (
            <p className="px-4 py-8 text-center text-sm text-destructive">{t("error")}</p>
          ) : (
            <>
              {!isFetching && players.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">{t("empty")}</p>}
              {players.map((player) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  locale={locale}
                  selected={player.id === selectedPlayerId}
                  positionLabel={t(`positions.${player.position}`)}
                  showAge={!!maxAge}
                  onSelect={() => onSelect(player)}
                />
              ))}
              {hasMore && <p className="px-4 py-3 text-center text-xs text-muted-foreground">{t("refine")}</p>}
            </>
          )}
        </CommandList>
      </Command>
    </>
  );
}

function PlayerRow({
  player,
  locale,
  selected,
  positionLabel,
  showAge,
  onSelect,
}: {
  player: Player;
  locale: string;
  selected: boolean;
  positionLabel: string;
  showAge: boolean;
  onSelect: () => void;
}) {
  return (
    <CommandItem value={`${player.name} ${player.id}`} onSelect={onSelect} className={cn("flex items-center gap-3 px-3 py-2", selected && "bg-page-accent-soft")}>
      <PlayerFlagAvatar player={player} size={36} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{player.name}</span>
        <span className="truncate text-xs text-muted-foreground">{playerCountry(player, locale)}</span>
      </div>
      {showAge && <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-2xs font-medium tabular-nums text-muted-foreground">{player.age}</span>}
      <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-2xs font-medium uppercase tracking-wide text-muted-foreground">{positionLabel}</span>
    </CommandItem>
  );
}
