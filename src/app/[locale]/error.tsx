"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  const t = useTranslations("error");

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="container flex flex-1 items-center justify-center py-12">
      <div className="flex max-w-md flex-col items-center gap-5 px-6 py-12 text-center">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-muted">
          <AlertTriangle className="size-6 text-muted-foreground" aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-lg font-semibold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
          <p className="text-sm text-muted-foreground">{t("hint")}</p>
        </div>
        <Button onClick={reset} className="gap-1.5 bg-foreground text-background hover:bg-foreground/90">
          <RotateCw className="size-4" aria-hidden />
          {t("retry")}
        </Button>
      </div>
    </div>
  );
}
