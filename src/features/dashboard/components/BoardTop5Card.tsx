"use client";

import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Card } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

import type { BoardMember } from "../types/dashboard.types";

type Props = {
  data: BoardMember[] | null;
};

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function BoardTop5Card({ data }: Props) {
  const t = useTranslations("dashboard.auth.boardTop5");

  const isEmpty = !data || data.length === 0;

  return (
    <Card size="sm" className="bg-card h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium">{t("title")}</span>
        <span className="text-xs text-muted-foreground">{t("boardName")}</span>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-3">
            <Users className="size-5 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium">{t("empty.title")}</span>
          <span className="text-xs text-muted-foreground mt-1">{t("empty.description")}</span>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            {data.map((member) => (
              <div
                key={member.userId}
                className={cn("flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-b-0", member.isCurrentUser && "bg-lime-50 dark:bg-lime-950/20")}
              >
                <span className="w-5 text-sm text-muted-foreground tabular-nums">{member.rank}</span>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {getInitials(member.firstName, member.lastName)}
                </div>
                <span className={cn("flex-1 text-sm", member.isCurrentUser && "font-medium")}>
                  {member.isCurrentUser ? t("you") : `${member.firstName} ${member.lastName.charAt(0)}.`}
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {member.points} {t("pts")}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end px-4 py-3 border-t border-border">
            {/* TODO: Add link to global board when available */}
            <Link href={`/boards/global`} className="flex items-center gap-1 text-xs font-medium hover:underline">
              {t("fullRanking")}
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}
