import { GitBranch, type LucideIcon, Target, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";

import { getBracketCompletedStages, getBracketProgressPercent } from "../lib/pickStatusDerivations";
import type { DashboardProgress } from "../types/dashboard.types";

import { CardReveal } from "./CardReveal";

type Props = {
  progress: DashboardProgress | null;
  isLoggedIn: boolean;
};

type PickStatusCardProps = {
  icon: LucideIcon;
  id: string;
  progress: number;
  statusText: string;
  buttonHref: string;
  isLoggedIn: boolean;
};

async function PickStatusCard({ icon: Icon, id, progress, statusText, buttonHref, isLoggedIn }: PickStatusCardProps) {
  const t = await getTranslations("dashboard.pickStatus");
  const ctaKey = !isLoggedIn || progress === 0 ? "start" : progress >= 100 ? "see" : "continue";
  // Status row is a "you're still mid-flow" cue — hide it once the card is
  // fully done, since the filled bar + 'See' button already say so.
  const showStatus = isLoggedIn && statusText && progress < 100;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
        <Icon className="size-5" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold leading-tight">{t(`${id}.title`)}</span>
          <span className="text-xs leading-snug text-muted-foreground">{t(`${id}.description`)}</span>
        </div>
        {isLoggedIn && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-page-accent transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {showStatus && <span className="text-xs font-medium tabular-nums text-muted-foreground">{statusText}</span>}
        <Button asChild variant="outline" size="sm" className="min-w-22 sm:min-w-28">
          <Link href={buttonHref}>{t(`${id}.${ctaKey}`)}</Link>
        </Button>
      </div>
    </div>
  );
}

export async function PickStatusSection({ progress, isLoggedIn }: Props) {
  const t = await getTranslations("dashboard.pickStatus");

  const pickemProgress = isLoggedIn && progress ? progress.pickem : null;
  const matchPicks = isLoggedIn && progress ? progress.match_picks : null;
  const awardsProgress = isLoggedIn && progress ? progress.awards : null;

  const bracketPercent = pickemProgress ? getBracketProgressPercent(pickemProgress) : 0;
  const bracketCompleted = pickemProgress ? getBracketCompletedStages(pickemProgress) : 0;
  const matchPercent = matchPicks && matchPicks.total > 0 ? (matchPicks.completed / matchPicks.total) * 100 : 0;
  const awardsPercent = awardsProgress && awardsProgress.total > 0 ? (awardsProgress.completed / awardsProgress.total) * 100 : 0;

  const picksStatus = [
    {
      id: "bracket",
      icon: GitBranch,
      progress: bracketPercent,
      statusText: pickemProgress ? t("bracket.progress", { current: bracketCompleted }) : "",
      buttonHref: "/pickems",
    },
    {
      id: "matchPicks",
      icon: Target,
      progress: matchPercent,
      statusText: matchPicks ? t("matchPicks.progress", { current: matchPicks.completed, total: matchPicks.total }) : "",
      buttonHref: "/schedule",
    },
    {
      id: "awards",
      icon: Trophy,
      progress: awardsPercent,
      statusText: awardsProgress ? t("awards.progress", { current: awardsProgress.completed, total: awardsProgress.total }) : "",
      buttonHref: "/awards",
    },
  ];

  return (
    <CardReveal className="flex h-full flex-1 flex-col gap-4 bg-card p-4 opacity-0 sm:p-5">
      <div className="flex flex-col gap-1">
        <span className="text-base font-semibold">{isLoggedIn ? t("title") : t("notLoggedIn")}</span>
        <span className="text-xs text-muted-foreground">{isLoggedIn ? t("subtitle") : t("notLoggedInSubtitle")}</span>
      </div>
      {/* Spacing matches LeaderboardSection's Tabs: Card's `gap-4` already
          provides 16px above this container; `mt-4` adds another 16px so the
          first sub-card top aligns with the TabsList top in the sibling card
          (which gets the same compound gap via Card.gap + Tabs.mt-4).
          Horizontal `px-0.75` aligns sub-card borders with the active tile
          inside that TabsList (it carries a `p-[3px]` inner inset). */}
      <div className="mt-4 flex flex-col gap-3 px-0.75">
        {picksStatus.map((pick) => (
          <PickStatusCard
            key={pick.id}
            icon={pick.icon}
            id={pick.id}
            progress={pick.progress}
            statusText={pick.statusText}
            buttonHref={pick.buttonHref}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    </CardReveal>
  );
}
