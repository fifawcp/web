import { GitBranch, Target, Trophy, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

import { getTeamName } from "@/shared/lib/getTeamName";
import { cn } from "@/shared/lib/utils";

import type { DashboardStats, Team } from "../types/dashboard.types";

import { CardReveal } from "./CardReveal";

type Props = {
  pickedChampion: Team | null;
  stats: DashboardStats;
  delay?: number;
};

// "Your standing" summary under the featured match: champion pick + both competition ranks.
// Mobile leads with the champion as a headline row and drops the two ranks into a 2-up tile row
// below it (so the full labels fit); desktop is the flat 3-up strip.
export async function StatsStrip({ pickedChampion, stats, delay }: Props) {
  const [t, locale] = await Promise.all([getTranslations("dashboard.stats"), getLocale()]);

  const championFlag = pickedChampion ? (
    <Image src={pickedChampion.flag_url} alt="" width={28} height={20} sizes="28px" className="h-4 w-6 shrink-0 rounded-xs object-cover" />
  ) : (
    // No pick yet — a flag-shaped placeholder, matching the schedule's undefined-team treatment.
    <span className="h-4 w-6 shrink-0 rounded-xs bg-muted" aria-hidden />
  );
  const championValue = pickedChampion ? getTeamName(pickedChampion, locale) : t("noChampion");

  return (
    <CardReveal delay={delay} className="opacity-0 bg-card p-0">
      {/* Mobile: champion headline, then the two ranks as tiles */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Label icon={Trophy}>{t("predictedChampion")}</Label>
          <StatValue flag={championFlag} value={championValue} muted={!pickedChampion} />
        </div>
        <div className="grid grid-cols-2 border-t border-border">
          <RankTile className="border-r border-border" icon={GitBranch} label={t("pickemRank")} points={stats.pickem.points} rank={stats.pickem.rank} />
          <RankTile icon={Target} label={t("matchRank")} points={stats.match.points} rank={stats.match.rank} />
        </div>
      </div>

      {/* Desktop: flat 3-up strip */}
      <div className="hidden divide-x divide-border sm:grid sm:grid-cols-3">
        <DesktopTile icon={Trophy} label={t("predictedChampion")}>
          <StatValue flag={championFlag} value={championValue} muted={!pickedChampion} />
        </DesktopTile>
        <DesktopTile icon={GitBranch} label={t("pickemRank")}>
          <StatValue value={`${stats.pickem.points} pts`} detail={`#${stats.pickem.rank}`} />
        </DesktopTile>
        <DesktopTile icon={Target} label={t("matchRank")}>
          <StatValue value={`${stats.match.points} pts`} detail={`#${stats.match.rank}`} />
        </DesktopTile>
      </div>
    </CardReveal>
  );
}

function Label({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-2xs uppercase tracking-wider text-muted-foreground">
      <Icon className="size-3 shrink-0" aria-hidden />
      <span className="truncate">{children}</span>
    </span>
  );
}

function StatValue({ flag, value, detail, muted }: { flag?: React.ReactNode; value?: string; detail?: string; muted?: boolean }) {
  return (
    <span className={cn("flex min-h-6 min-w-0 gap-1.5", flag ? "items-center" : "items-baseline")}>
      {flag}
      {value &&
        (muted ? (
          // No pick: a quiet label, sized to match the rank detail (e.g. "#21").
          <span className="truncate text-xs font-medium text-muted-foreground">{value}</span>
        ) : (
          <span className="truncate font-heading text-sm font-bold leading-tight sm:text-base">{value}</span>
        ))}
      {detail && <span className="shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">{detail}</span>}
    </span>
  );
}

function DesktopTile({ icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <Label icon={icon}>{label}</Label>
      {children}
    </div>
  );
}

// Mobile rank tile: label up top (wraps to 2 lines), points pinned to the bottom so both
// tiles' values align even when one label wraps and the other doesn't.
function RankTile({ icon: Icon, label, points, rank, className }: { icon: LucideIcon; label: string; points: number; rank: number; className?: string }) {
  return (
    <div className={cn("flex flex-col justify-between gap-2 px-4 py-3", className)}>
      <span className="flex items-start gap-1.5 text-2xs uppercase leading-tight tracking-wider text-muted-foreground">
        <Icon className="mt-px size-3 shrink-0" aria-hidden />
        <span className="line-clamp-2">{label}</span>
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="font-heading text-base font-bold leading-tight">{points} pts</span>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">#{rank}</span>
      </span>
    </div>
  );
}
