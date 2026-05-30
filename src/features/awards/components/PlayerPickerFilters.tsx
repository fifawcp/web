"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

import { PLAYER_POSITIONS } from "../lib/awards";
import type { PlayerPosition } from "../types/awards.types";

type Props = {
  /** Hidden when the award locks position (Golden Glove) — only country applies. */
  lockedPosition?: PlayerPosition;
  positions: PlayerPosition[];
  onTogglePosition: (pos: PlayerPosition) => void;
  countries: string[];
  onToggleCountry: (fifaCode: string) => void;
  teams: Team[];
  teamsLoading: boolean;
  hasFilters: boolean;
  onClear: () => void;
  onDone: () => void;
};

/** Filter panel that swaps into the fixed-height list area — position + country. */
export function PlayerPickerFilters({
  lockedPosition,
  positions,
  onTogglePosition,
  countries,
  onToggleCountry,
  teams,
  teamsLoading,
  hasFilters,
  onClear,
  onDone,
}: Props) {
  const t = useTranslations("awards.picker");
  const locale = useLocale();

  return (
    <div className="flex flex-col">
      <div className="space-y-4 p-3">
        {!lockedPosition && (
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("filtersPosition")}</legend>
            <div className="flex flex-wrap gap-1.5">
              {PLAYER_POSITIONS.map((pos) => {
                const active = positions.includes(pos);
                return (
                  <button
                    key={pos}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onTogglePosition(pos)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-page-accent bg-page-accent-soft text-page-accent-strong"
                        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {t(`positions.${pos}`)}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("filtersCountry")}</p>
          <CountryCombobox locale={locale} teams={teams} teamsLoading={teamsLoading} selected={countries} onToggle={onToggleCountry} t={t} />
          {countries.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {countries.map((code) => {
                const team = teams.find((tm) => tm.fifa_code === code);
                const label = team ? getTeamName(team, locale) : code;
                return (
                  <span key={code} className="inline-flex items-center gap-1.5 rounded-md bg-page-accent-soft py-1 pr-1 pl-2 text-xs font-medium text-page-accent-strong">
                    {team?.flag_url && <img src={team.flag_url} alt="" className="h-3 w-4 rounded-xs object-cover" loading="lazy" decoding="async" />}
                    <span className="max-w-32 truncate">{label}</span>
                    <button type="button" onClick={() => onToggleCountry(code)} className="rounded-xs p-0.5 hover:bg-page-accent/15" aria-label={`${label} ✕`}>
                      <X className="size-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border p-3">
        <button
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
        >
          {t("filtersClear")}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-md bg-page-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-page-accent/90"
        >
          {t("filtersDone")}
        </button>
      </div>
    </div>
  );
}

type ComboboxProps = {
  locale: string;
  teams: Team[];
  teamsLoading: boolean;
  selected: string[];
  onToggle: (fifaCode: string) => void;
  t: ReturnType<typeof useTranslations>;
};

/** Searchable multi-select dropdown for countries. */
function CountryCombobox({ locale, teams, teamsLoading, selected, onToggle, t }: ComboboxProps) {
  const label = selected.length > 0 ? t("filtersCountrySelected", { n: selected.length }) : t("filtersCountryPlaceholder");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
        >
          <span className={cn("truncate", selected.length === 0 && "text-muted-foreground")}>{label}</span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder={t("filtersCountrySearch")} />
          <CommandList className="p-1 pt-2">
            {teamsLoading ? (
              <p className="py-4 text-center text-xs text-muted-foreground">{t("filtersCountryLoading")}</p>
            ) : (
              <>
                <CommandEmpty>{t("filtersCountryEmpty")}</CommandEmpty>
                {teams.map((team) => {
                  const name = getTeamName(team, locale);
                  const active = selected.includes(team.fifa_code);
                  return (
                    <CommandItem key={team.fifa_code} value={`${name} ${team.fifa_code}`} onSelect={() => onToggle(team.fifa_code)} className="gap-2.5">
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                          active ? "border-page-accent bg-page-accent-soft text-page-accent-strong" : "border-border"
                        )}
                      >
                        {active && <Check className="size-3" />}
                      </span>
                      {team.flag_url && <img src={team.flag_url} alt="" className="h-3 w-4 rounded-xs object-cover" loading="lazy" decoding="async" />}
                      <span className="truncate">{name}</span>
                    </CommandItem>
                  );
                })}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
