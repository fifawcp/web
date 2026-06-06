import { ListChecks, Swords, Trophy, type LucideIcon } from "lucide-react";

import type { CompetitionType } from "../types/competitions.types";

type CompetitionTypeMeta = {
  icon: LucideIcon;
  labelKey: CompetitionType; // key under the `competitions.type` namespace
  tileClass: string; // per-type tinted icon tile
};

// One source of truth for a competition type's icon, label, and accent.
const META: Record<CompetitionType, CompetitionTypeMeta> = {
  pickem: { icon: ListChecks, labelKey: "pickem", tileClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  match: { icon: Trophy, labelKey: "match", tileClass: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" },
  pool: { icon: Swords, labelKey: "pool", tileClass: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
};

export function competitionTypeMeta(type: CompetitionType): CompetitionTypeMeta {
  return META[type];
}
