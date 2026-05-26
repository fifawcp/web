"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error }: Props) {
  const t = useTranslations("error");

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="container flex flex-1 items-center justify-center py-12">
      <div className="flex max-w-md flex-col items-center gap-3 rounded-lg px-6 py-12 text-center">
        <AlertTriangle className="size-6 text-muted-foreground" aria-hidden />
        <h1 className="text-base font-semibold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>
    </div>
  );
}
