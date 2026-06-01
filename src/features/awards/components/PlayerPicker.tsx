"use client";

import { useState } from "react";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Command, CommandItem, CommandList } from "@/shared/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";

import { useFilterTeams } from "../hooks/useFilterTeams";
import { usePlayerSearch } from "../hooks/usePlayerSearch";
import { usePopularPicks } from "../hooks/usePopularPicks";
import { AWARD_CONFIG, playerCountry, positionChipClasses } from "../lib/awards";
import type { AwardType, Player, PlayerPosition } from "../types/awards.types";

import { PlayerFlag } from "./PlayerFlag";
import { PlayerPickerFilters } from "./PlayerPickerFilters";

type Props = {
  awardType: AwardType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Currently-picked player for this slot, if any (highlighted in the list). */
  selectedPlayerId?: number;
  onSelect: (player: Player) => void;
};

/**
 * Searchable player picker. The body mounts only while `open`, so each open
 * starts fresh and closing unmounts immediately — cancelling any in-flight
 * search and dismissing the dialog without lag.
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
  const [countries, setCountries] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // A position-locked award (Golden Glove) always constrains to its position,
  // regardless of the toggle row (which is hidden in that case).
  const activePositions = lockedPosition ? [lockedPosition] : positions;

  const search = usePlayerSearch({ q: query, positions: activePositions, teamFifaCodes: countries, enabled: true });
  const popular = usePopularPicks(!search.hasCriteria);
  const { teams, isLoading: teamsLoading } = useFilterTeams(filtersOpen || countries.length > 0);

  // With no query or filter we show the shared popular list; any input switches
  // to live search. Popular rows are eligibility-filtered server-side; search
  // results enforce the U21 rule client-side (the API has no age param).
  const showingPopular = !search.hasCriteria;
  const players = showingPopular
    ? (popular.data?.[awardType] ?? []).map((p) => p.player)
    : (search.data?.players ?? []).filter((p) => (maxAge ? p.age == null || p.age <= maxAge : true));

  const isFetching = showingPopular ? popular.isLoading : search.isFetching;
  const busy = isFetching || search.isDebouncing;
  const error = showingPopular ? popular.error : search.error;
  const hasMore = !showingPopular && (search.data?.hasMore ?? false);

  const description = maxAge ? t("descriptionAge", { age: maxAge }) : lockedPosition ? t("descriptionLocked") : t("description");

  const filterCount = positions.length + countries.length;
  const countryName = (code: string) => {
    const team = teams.find((tm) => tm.fifa_code === code);
    return team ? getTeamName(team, locale) : code;
  };

  function togglePosition(pos: PlayerPosition) {
    setPositions((prev) => (prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]));
  }
  function toggleCountry(code: string) {
    setCountries((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }
  function clearFilters() {
    setPositions([]);
    setCountries([]);
  }

  return (
    <>
      <DialogHeader className="gap-1 border-b border-border p-4">
        <DialogTitle>{t("title", { award: tTypes(`${awardType}.title`) })}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>

      <Command shouldFilter={false} className="rounded-none bg-transparent">
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
          {busy && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />}
        </div>

        {/* Filters trigger + active-filter chips. */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-3 py-2.5">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className={cn(
              "inline-flex w-full items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors sm:w-auto sm:justify-start sm:py-1",
              filtersOpen ? "border-page-accent bg-page-accent-soft text-page-accent-strong" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="size-3.5" />
            {t("filters")}
            {filterCount > 0 && <span className="rounded-full bg-page-accent px-1.5 text-[10px] font-semibold text-white tabular-nums">{filterCount}</span>}
          </button>

          {!filtersOpen && positions.map((pos) => <FilterChip key={pos} label={t(`positions.${pos}`)} onRemove={() => togglePosition(pos)} />)}
          {!filtersOpen && countries.map((code) => <FilterChip key={code} label={countryName(code)} onRemove={() => toggleCountry(code)} />)}
        </div>

        {filtersOpen ? (
          <PlayerPickerFilters
            lockedPosition={lockedPosition}
            positions={positions}
            onTogglePosition={togglePosition}
            countries={countries}
            onToggleCountry={toggleCountry}
            teams={teams}
            teamsLoading={teamsLoading}
            hasFilters={filterCount > 0}
            onClear={clearFilters}
            onDone={() => setFiltersOpen(false)}
          />
        ) : (
          /* Fixed height so the dialog never jumps as result counts change. */
          <CommandList className="h-80 max-h-none">
            {error ? (
              <Centered className="text-destructive">{t("error")}</Centered>
            ) : players.length === 0 ? (
              isFetching ? (
                <PlayerRowsSkeleton />
              ) : (
                <Centered>{t("empty")}</Centered>
              )
            ) : (
              <>
                {showingPopular && (
                  <p className="sticky top-0 z-10 bg-popover px-3 py-2 text-2xs font-medium uppercase tracking-wide text-muted-foreground">{t("popularTitle")}</p>
                )}
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
        )}
      </Command>
    </>
  );
}

/** Removable chip summarizing one active filter. */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-page-accent-soft py-1 pr-1 pl-2 text-xs font-medium text-page-accent-strong">
      <span className="max-w-32 truncate">{label}</span>
      <button type="button" onClick={onRemove} className="rounded-xs p-0.5 hover:bg-page-accent/15" aria-label={`${label} ✕`}>
        <X className="size-3" />
      </button>
    </span>
  );
}

/** Fills the fixed-height list area with vertically-centered content. */
function Centered({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex h-80 items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground", className)}>{children}</div>;
}

/** Placeholder rows mirroring PlayerRow's layout while results load. */
function PlayerRowsSkeleton() {
  return (
    <div aria-hidden>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="h-6 w-9 rounded-xs" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      ))}
    </div>
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
  const country = playerCountry(player, locale);
  const club = player.club?.name;

  return (
    <CommandItem value={`${player.name} ${player.id}`} onSelect={onSelect} className={cn("flex items-center gap-3 px-3 py-2", selected && "bg-page-accent-soft")}>
      <PlayerFlag player={player} size={24} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{player.name}</span>
        {(country || club) && (
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            {country && <span className="shrink-0">{country}</span>}
            {country && club && <span className="text-muted-foreground/40">|</span>}
            {club && <span className="truncate">{club}</span>}
          </span>
        )}
      </div>
      {showAge && player.age != null && (
        <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-2xs font-medium tabular-nums text-muted-foreground">{player.age}</span>
      )}
      <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-2xs font-medium uppercase tracking-wide", positionChipClasses(player.position))}>{positionLabel}</span>
    </CommandItem>
  );
}
