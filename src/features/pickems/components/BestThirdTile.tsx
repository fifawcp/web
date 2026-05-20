"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";

import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";
import type { Team } from "@/shared/types/wcp.types";

type Props = {
  team: Team;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export function BestThirdTile({ team, selected, disabled, onToggle }: Props) {
  const t = useTranslations("pickems.bestThirds");
  const locale = useLocale();

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group flex items-center gap-3 rounded-xl border bg-card px-3 py-3 text-left transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60",
        !disabled && "cursor-pointer hover:bg-muted",
        selected ? "border-page-accent" : "border-border"
      )}
    >
      {/* Visual-only checkbox — using a real <Checkbox> would nest a <button> inside this <button>. */}
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          selected ? "border-page-accent bg-page-accent text-white" : "border-input bg-card text-transparent"
        )}
      >
        <Check className="size-3.5" />
      </span>

      <div className="shrink-0 overflow-hidden rounded-xs ring-1 ring-border/60">
        <Image src={team.flag_url} alt="" width={36} height={24} sizes="36px" className="h-6 w-9 object-cover" />
      </div>

      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{getTeamName(team, locale)}</span>

      <span className="shrink-0 font-mono text-2xs uppercase tracking-wider text-muted-foreground">{t("groupTag", { code: team.group_code })}</span>
    </button>
  );
}
