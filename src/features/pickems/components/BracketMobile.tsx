"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";

import { STAGES, STAGE_MATCH_IDS } from "../lib/bracketStructure";
import type { BracketMatchSlot, BracketStageCode } from "../types/pickems.types";

import { BracketChampionCard } from "./BracketChampionCard";
import { BracketMatchCard } from "./BracketMatchCard";

type Props = {
  bracket: BracketMatchSlot[];
  champion: BracketMatchSlot["picked_team"];
  disabled?: boolean;
  onPick: (matchId: number, fifaCode: string) => void;
  activeStage: BracketStageCode;
  onStageChange: (stage: BracketStageCode) => void;
};

export function BracketMobile({ bracket, champion, disabled, onPick, activeStage, onStageChange }: Props) {
  const t = useTranslations("pickems.bracket");
  const tRounds = useTranslations("pickems.bracket.rounds");
  const tShort = useTranslations("pickems.bracket.roundsShort");

  const byId = useMemo(() => new Map(bracket.map((slot) => [slot.match_id, slot] as const)), [bracket]);

  const tabsMeta = STAGES.map((stage) => {
    const ids = STAGE_MATCH_IDS[stage];
    const total = ids.length;
    const completed = ids.reduce((acc, id) => (byId.get(id)?.picked_team ? acc + 1 : acc), 0);
    return { stage, total, completed };
  });

  const activeIds = STAGE_MATCH_IDS[activeStage];
  const activeMeta = tabsMeta.find((m) => m.stage === activeStage);

  return (
    <div className="lg:hidden">
      <div className="space-y-4">
        {champion && <BracketChampionCard champion={champion} />}

        <div className="grid grid-cols-6 gap-1 rounded-xl border bg-card p-1">
          {tabsMeta.map((meta) => {
            const isActive = meta.stage === activeStage;
            return (
              <button
                key={meta.stage}
                type="button"
                onClick={() => onStageChange(meta.stage)}
                className={cn(
                  "rounded-md px-2 py-2 text-center text-xs font-medium transition-colors",
                  isActive ? "bg-page-accent text-white" : "cursor-pointer text-muted-foreground hover:bg-muted"
                )}
              >
                <div>{tShort(meta.stage)}</div>
                <div className={cn("font-mono text-2xs uppercase tracking-wider", isActive ? "text-white/75" : "text-muted-foreground")}>
                  {meta.completed}/{meta.total}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-baseline justify-between px-1">
          <h3 className="text-base font-semibold text-foreground">{tRounds(activeStage)}</h3>
          <span className="text-xs text-muted-foreground">{t("pickRoundCount", { n: activeMeta?.total ?? 0 })}</span>
        </div>

        <ul className="space-y-3">
          {activeIds.map((id) => {
            const slot = byId.get(id);
            if (!slot) return null;
            return (
              <li key={id}>
                <BracketMatchCard slot={slot} disabled={disabled} onPick={(code) => onPick(id, code)} showId />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
