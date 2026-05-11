"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/shared/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

import type { Team } from "../types/schedule.types";

import { CHIP_TRIGGER_CLASS, STACKED_TRIGGER_CLASS } from "./chipStyles";

type Props = {
  value: string; // "all" or fifa_code
  onChange: (next: string) => void;
  teams: Team[];
  locale: string;
  variant?: "chip" | "stacked";
  widthClass?: string;
};

export function TeamCombobox({ value, onChange, teams, locale, variant = "chip", widthClass }: Props) {
  const t = useTranslations("schedule.filters");
  const [open, setOpen] = useState(false);

  const selected = value === "all" ? null : (teams.find((team) => team.fifa_code === value) ?? null);
  const valueLabel = selected ? selected.name[locale] : t("team.all");

  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const triggerClass = variant === "chip" ? CHIP_TRIGGER_CLASS : STACKED_TRIGGER_CLASS;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={t("team.label")} className={cn(triggerClass, widthClass, "flex items-center justify-between")}>
        {variant === "chip" ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 text-muted-foreground">{t("team.label")}:</span>
            <span className="truncate">{valueLabel}</span>
          </span>
        ) : (
          <span className="min-w-0 truncate">{valueLabel}</span>
        )}
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-(--radix-popover-trigger-width) min-w-56 max-w-80 p-0">
        <Command>
          <CommandInput placeholder={t("team.search")} />
          <CommandList>
            <CommandEmpty>{t("noResults")}</CommandEmpty>
            <CommandGroup>
              <CommandItem value={`__all__ ${t("team.all")}`} onSelect={() => select("all")} data-checked={value === "all"}>
                <Check className={cn("size-4", value === "all" ? "opacity-100" : "opacity-0")} />
                <span>{t("team.all")}</span>
              </CommandItem>
              {teams.map((team) => {
                const label = team.name[locale];
                return (
                  <CommandItem key={team.fifa_code} value={`${label} ${team.fifa_code}`} onSelect={() => select(team.fifa_code)} data-checked={value === team.fifa_code}>
                    <Check className={cn("size-4", value === team.fifa_code ? "opacity-100" : "opacity-0")} />
                    <span className="flex-1 truncate">{label}</span>
                    <span className="text-xs text-muted-foreground">{team.fifa_code}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
