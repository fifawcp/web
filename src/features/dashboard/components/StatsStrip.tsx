import { GitBranch, Target, Trophy, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { getTeamName } from "@/shared/lib/getTeamName";

import type { DashboardStats, Team } from "../types/dashboard.types";

import { CardReveal } from "./CardReveal";

type Props = {
  pickedChampion: Team | null;
  stats: DashboardStats;
  delay?: number;
};

// Compact "your standing" strip under the featured match: champion pick + both competition ranks.
export async function StatsStrip({ pickedChampion, stats, delay }: Props) {
  const [t, locale] = await Promise.all([getTranslations("dashboard.stats"), getLocale()]);

  return (
    <CardReveal delay={delay} className="opacity-0 grid grid-cols-3 divide-x divide-border bg-card p-0">
      <StatTile
        label={t("predictedChampion")}
        icon={Trophy}
        iconContent={
          pickedChampion ? <Image src={pickedChampion.flag_url} alt="" width={28} height={20} sizes="28px" className="h-3.5 w-5.5 rounded-xs object-cover" /> : null
        }
        value={pickedChampion ? getTeamName(pickedChampion, locale) : "—"}
      />
      <StatTile label={t("pickemRank")} icon={GitBranch} value={`${stats.pickem.points} pts`} detail={`#${stats.pickem.rank}`} />
      <StatTile label={t("matchRank")} icon={Target} value={`${stats.match.points} pts`} detail={`#${stats.match.rank}`} />
    </CardReveal>
  );
}

type StatTileProps = {
  label: string;
  icon: LucideIcon;
  iconContent?: React.ReactNode;
  value: string;
  detail?: string;
};

function StatTile({ label, icon: Icon, iconContent, value, detail }: StatTileProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-3 py-3 sm:px-4">
      <span className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-muted-foreground">
        <Icon className="size-3 shrink-0" aria-hidden />
        <span className="truncate">{label}</span>
      </span>
      <span className="flex min-w-0 items-baseline gap-1.5">
        {iconContent}
        <span className="truncate font-heading text-sm font-bold leading-tight sm:text-base">{value}</span>
        {detail && <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">{detail}</span>}
      </span>
    </div>
  );
}
