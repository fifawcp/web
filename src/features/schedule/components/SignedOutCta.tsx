import { LogIn } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

export function SignedOutCta() {
  const t = useTranslations("schedule.signedOut");

  return (
    <Card size="sm" className="flex-row items-center gap-3 px-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
        <LogIn className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-heading text-sm font-medium">{t("title")}</div>
        <div className="text-xs text-muted-foreground">{t("description")}</div>
      </div>
      <Button asChild size="sm" className="shrink-0 bg-page-accent text-background hover:bg-page-accent-strong">
        <Link href="/login">{t("cta")}</Link>
      </Button>
    </Card>
  );
}
