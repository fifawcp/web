"use client";

import type { ReactNode } from "react";

import { ArrowRight, Calendar, GitBranch, List } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Card } from "@/shared/components/ui/card";

type NavCardProps = {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
};

function NavCard({ href, icon, title, description }: NavCardProps) {
  return (
    <Link href={href}>
      <Card className="bg-card p-4 hover:bg-muted transition-colors cursor-pointer group flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">{icon}</div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{title}</span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </div>
        </div>
        <ArrowRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
      </Card>
    </Link>
  );
}

export function NavigationCards() {
  const t = useTranslations("dashboard.guest.navigation");

  return (
    <div className="flex flex-col gap-3">
      <NavCard href="/schedule" icon={<Calendar className="size-5" />} title={t("schedule.title")} description={t("schedule.description")} />
      <NavCard href="/standings" icon={<List className="size-5" />} title={t("standings.title")} description={t("standings.description")} />
      <NavCard href="/bracket" icon={<GitBranch className="size-5" />} title={t("bracket.title")} description={t("bracket.description")} />
    </div>
  );
}
