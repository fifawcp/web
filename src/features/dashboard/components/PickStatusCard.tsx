"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { GitBranch, type LucideIcon, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { pickStatusCardAnimation } from "../animations/card.animations";
import type { MatchPickProgress, PickemProgress, TournamentAwards, UserPickemSummary } from "../types/dashboard.types";

type Props = {
  pickem: UserPickemSummary | null;
  matchProgress: MatchPickProgress | null;
  awards: TournamentAwards | null;
  isLoggedIn: boolean;
};

type PickStatusItemProps = {
  icon: LucideIcon;
  id: string;
  progress: number;
  statusText: string;
  buttonHref: string;
  isLast?: boolean;
  isLoggedIn: boolean;
};

function PickStatusItem({ icon: Icon, id, progress, statusText, buttonHref, isLast, isLoggedIn }: PickStatusItemProps) {
  const t = useTranslations("dashboard.pickStatus");

  const ctaKey = !isLoggedIn || progress === 0 ? "start" : progress >= 100 ? "see" : "continue";

  return (
    <div className={`flex items-start gap-3 p-3 sm:p-4 ${!isLast ? "border-b border-border" : ""}`}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-sm font-medium">{t(`${id}.title`)}</span>
        <span className="text-xs text-muted-foreground">{t(`${id}.description`)}</span>
        {isLoggedIn && (
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-lime-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        {isLoggedIn && statusText && <span className="text-xs text-muted-foreground">● {statusText}</span>}
        <Button asChild variant="outline" size="sm" className="px-0 min-w-22 sm:px-2 sm:min-w-32">
          <Link href={buttonHref}>{t(`${id}.${ctaKey}`)}</Link>
        </Button>
      </div>
    </div>
  );
}

function getBracketProgressPercent(progress: PickemProgress): number {
  const total = progress.groups.total + progress.best_thirds.total + progress.bracket.total;
  const completed = progress.groups.completed + progress.best_thirds.completed + progress.bracket.completed;
  return total > 0 ? (completed / total) * 100 : 0;
}

function getCurrentBracketStep(progress: PickemProgress): number {
  if (!progress.groups.is_complete) return 1;
  if (!progress.best_thirds.is_complete) return 2;
  return 3;
}

function countPickedAwards(awards: TournamentAwards): number {
  return [awards.golden_boot, awards.golden_glove, awards.golden_ball, awards.young_player].filter((a) => a.picked).length;
}

export function PickStatusCard({ pickem, matchProgress, awards, isLoggedIn }: Props) {
  const t = useTranslations("dashboard.pickStatus");
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) {
      return;
    }

    return pickStatusCardAnimation({
      card: cardRef.current,
    });
  }, []);

  const bracketPercent = isLoggedIn && pickem ? getBracketProgressPercent(pickem.progress) : 0;
  const bracketStep = isLoggedIn && pickem ? getCurrentBracketStep(pickem.progress) : 0;
  const matchPercent = isLoggedIn && matchProgress ? (matchProgress.made / matchProgress.total) * 100 : 0;
  const awardsPicked = isLoggedIn && awards ? countPickedAwards(awards) : 0;
  const awardsPercent = (awardsPicked / 4) * 100;

  const picksStatus = [
    {
      id: "bracket",
      icon: GitBranch,
      progress: bracketPercent,
      statusText: isLoggedIn ? t("bracket.step", { current: bracketStep }) : "",
      buttonHref: "/bracket",
    },
    {
      id: "matchPicks",
      icon: Target,
      progress: matchPercent,
      statusText: isLoggedIn ? t("matchPicks.match", { current: matchProgress?.made ?? 0, total: matchProgress?.total ?? 0 }) : "",
      buttonHref: "/schedule",
    },
    {
      id: "awards",
      icon: Trophy,
      progress: awardsPercent,
      statusText: isLoggedIn ? t("awards.picked", { count: awardsPicked }) : "",
      buttonHref: "/awards",
    },
  ];

  return (
    <Card ref={cardRef} size="sm" className="bg-card h-full flex-1 opacity-0">
      <div className="flex px-4 py-3 border-b border-border">
        <span className="text-sm font-medium">{isLoggedIn ? t("title") : t("notLoggedIn")}</span>
      </div>
      {picksStatus.map((pick, index) => (
        <PickStatusItem
          key={pick.id}
          icon={pick.icon}
          id={pick.id}
          progress={pick.progress}
          statusText={pick.statusText}
          buttonHref={pick.buttonHref}
          isLast={index === picksStatus.length - 1}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </Card>
  );
}
