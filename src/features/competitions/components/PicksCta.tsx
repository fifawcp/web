"use client";

import { Check, CheckCircle2, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type { CompetitionPickState } from "../lib/competitionPickStatus";

type Props = { href: string; state: CompetitionPickState["kind"]; variant?: "card" | "header"; singular?: boolean };

// The "make/view picks" CTA shared by the competition card (text-link "done") and the detail header
// (soft-pill "done"). The closed/open states render identically across both. `singular` swaps to
// single-pick wording for `pick` competitions ("View pick" vs "View picks").
export function PicksCta({ href, state, variant = "card", singular = false }: Props) {
  const t = useTranslations("competitions.card");

  if (state === "picks-done") {
    const label = singular ? t("picked") : t("picksDone");
    return variant === "header" ? (
      <Link
        href={href}
        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-page-accent-soft px-3 py-1.5 text-sm font-medium text-page-accent-strong transition-colors hover:bg-page-accent-soft/80"
      >
        <CheckCircle2 className="size-4" aria-hidden />
        {label}
      </Link>
    ) : (
      <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-page-accent-strong transition-colors hover:text-page-accent hover:underline">
        <Check className="size-4" aria-hidden />
        {label}
      </Link>
    );
  }

  if (state === "closed") {
    return (
      <Button asChild variant="outline" size="sm" className={cn(variant === "header" && "sm:px-4")}>
        <Link href={href}>{singular ? t("viewPick") : t("viewPicks")}</Link>
      </Button>
    );
  }

  return (
    <Button asChild size="sm" className="gap-1 bg-page-accent text-white hover:bg-page-accent/90">
      <Link href={href}>
        {singular ? t("makePick") : t("makePicks")}
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </Button>
  );
}
