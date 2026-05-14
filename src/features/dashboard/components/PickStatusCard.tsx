"use client";

import { GitBranch, LucideIcon, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import type { PickStatusData } from "../types/dashboard.types";

type Props = {
  data: PickStatusData | null;
};

type PickStatusItemProps = {
  icon: LucideIcon;
  id: string;
  progress?: number;
  statusText?: string;
  buttonHref: string;
  isLast?: boolean;
};

function PickStatusItem({ icon: Icon, id, progress, statusText, buttonHref, isLast }: PickStatusItemProps) {
  const t = useTranslations("dashboard.auth.pickStatus");

  return (
    <div className={`flex items-start gap-3 p-3 sm:p-4 ${!isLast ? "border-b border-border" : ""}`}>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <span className="text-sm font-medium">{t(`${id}.title`)}</span>
        <span className="text-xs text-muted-foreground">{t(`${id}.description`)}</span>

        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-lime-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        {statusText && <span className="text-xs text-muted-foreground">● {statusText}</span>}
        <Button asChild variant="outline" size="sm" className="min-w-24 sm:min-w-32">
          <Link href={buttonHref}>{t(`${id}.${progress === 0 ? "start" : progress === 100 ? "see" : "continue"}`)}</Link>
        </Button>
      </div>
    </div>
  );
}

export function PickStatusCard({ data }: Props) {
  const t = useTranslations("dashboard.auth.pickStatus");

  const picksStatus = [
    {
      id: "bracket",
      icon: GitBranch,
      progress: data ? (data.currentBracketStep / 4) * 100 : 0,
      statusText: t("bracket.step", { current: data?.currentBracketStep ?? 0 }),
      buttonHref: "/bracket",
    },
    {
      id: "matchPicks",
      icon: Target,
      progress: data ? (data.gamesCount / data.gamesCountTotal) * 100 : 0,
      statusText: t("matchPicks.match", { current: data?.gamesCount ?? 0, total: data?.gamesCountTotal ?? 0 }),
      buttonHref: "/schedule",
    },
    {
      id: "awards",
      icon: Trophy,
      statusText: t("awards.picked", { count: data?.awardsPicked ?? 0 }),
      progress: data ? (data.awardsPicked / 4) * 100 : 0,
      buttonHref: "/awards",
    },
  ];
  return (
    <Card size="sm" className="bg-card h-full gap-2 sm:gap-4">
      <div className="flex px-4 py-3 border-b border-border">
        <span className="text-sm font-medium">{t("title")}</span>
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
        />
      ))}
    </Card>
  );
}
