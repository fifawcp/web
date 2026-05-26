"use client";

import { Flag, Plus, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type { Competition } from "../types/competitions.types";

type Props = {
  competitions: Competition[];
  activeCompetitionId: number | null;
  onSelect: (id: number) => void;
  canCreate: boolean;
  onCreate: () => void;
};

export function CompetitionTabs({ competitions, activeCompetitionId, onSelect, canCreate, onCreate }: Props) {
  const t = useTranslations("competitions");

  return (
    <div className="border-b border-border">
      <div className="container">
        <div className="flex items-center gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex flex-1 items-center gap-1">
            {competitions.map((competition) => {
              const isActive = competition.id === activeCompetitionId;
              const Icon = competition.type === "pickem" ? Flag : Trophy;
              return (
                <button
                  key={competition.id}
                  type="button"
                  onClick={() => onSelect(competition.id)}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
                    isActive ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-pressed={isActive}
                >
                  <Icon className="size-3.5" aria-hidden />
                  <span>{competition.name}</span>
                </button>
              );
            })}
          </div>
          {canCreate ? (
            <Button variant="outline" size="sm" onClick={onCreate} className="shrink-0 gap-1.5">
              <Plus className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">{t("tabs.createCompetition")}</span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
