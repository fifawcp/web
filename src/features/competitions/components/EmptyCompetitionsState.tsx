"use client";

import { Plus, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";

type Props = {
  canCreate: boolean;
  onCreate: () => void;
};

export function EmptyCompetitionsState({ canCreate, onCreate }: Props) {
  const t = useTranslations("competitions.emptyCompetitions");

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <span className="grid size-12 place-items-center rounded-lg bg-muted">
          <Trophy className="size-5 text-muted-foreground" aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">{canCreate ? t("descriptionAdmin") : t("descriptionMember")}</p>
        </div>
        {canCreate ? (
          <Button onClick={onCreate} className="gap-1.5">
            <Plus className="size-4" aria-hidden />
            {t("cta")}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
