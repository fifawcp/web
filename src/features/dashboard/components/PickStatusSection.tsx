"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { GitBranch, type LucideIcon, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { cardFadeUpAnimation } from "../animations/card.animations";
import { getBracketProgressPercent, getCurrentBracketStep } from "../lib/pickStatusDerivations";
import type { DashboardProgress } from "../types/dashboard.types";

type Props = {
  progress: DashboardProgress | null;
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

export function PickStatusSection({ progress, isLoggedIn }: Props) {
  const t = useTranslations("dashboard.pickStatus");
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;
    return cardFadeUpAnimation({ card: cardRef.current });
  }, []);

  const pickemProgress = isLoggedIn && progress ? progress.pickem : null;
  const matchPicks = isLoggedIn && progress ? progress.match_picks : null;
  const awardsProgress = isLoggedIn && progress ? progress.awards : null;

  const bracketPercent = pickemProgress ? getBracketProgressPercent(pickemProgress) : 0;
  const bracketStep = pickemProgress ? getCurrentBracketStep(pickemProgress) : 0;
  const matchPercent = matchPicks && matchPicks.total > 0 ? (matchPicks.completed / matchPicks.total) * 100 : 0;
  const awardsPercent = awardsProgress && awardsProgress.total > 0 ? (awardsProgress.completed / awardsProgress.total) * 100 : 0;

  const picksStatus = [
    {
      id: "bracket",
      icon: GitBranch,
      progress: bracketPercent,
      statusText: pickemProgress ? t("bracket.step", { current: bracketStep }) : "",
      buttonHref: "/bracket",
    },
    {
      id: "matchPicks",
      icon: Target,
      progress: matchPercent,
      statusText: matchPicks ? t("matchPicks.match", { current: matchPicks.completed, total: matchPicks.total }) : "",
      buttonHref: "/schedule",
    },
    {
      id: "awards",
      icon: Trophy,
      progress: awardsPercent,
      statusText: awardsProgress ? t("awards.picked", { count: awardsProgress.completed }) : "",
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
