"use client";

import { ArrowLeft, ArrowRight, CloudUpload, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

export type CTAAction =
  | { kind: "hidden" }
  | { kind: "continue"; label?: string; disabled?: boolean; loading?: boolean; helperText?: string; onClick: () => void }
  | { kind: "submit"; label?: string; disabled?: boolean; loading?: boolean; helperText?: string; onClick: () => void };

type Props = {
  onBack?: () => void;
  onSaveDraft?: () => void;
  action: CTAAction;
};

export function PickemsCTABar({ onBack, onSaveDraft, action }: Props) {
  const t = useTranslations("pickems.common");

  if (action.kind === "hidden" && !onBack && !onSaveDraft) return null;

  const spinner = <Loader2 className="size-4 animate-spin" aria-label={t("saving")} />;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background py-3 lg:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      {action.kind !== "hidden" && action.helperText && <p className="container pb-2 text-center text-2xs text-muted-foreground">{action.helperText}</p>}
      <div className="container flex items-center gap-2">
        {onBack && (
          <Button variant="outline" size="sm" onClick={onBack} className="h-10 flex-1 cursor-pointer gap-1.5">
            <ArrowLeft className="size-4" />
            <span>{t("back")}</span>
          </Button>
        )}
        {onSaveDraft && (
          <Button variant="outline" size="sm" onClick={onSaveDraft} className="h-10 flex-1 cursor-pointer gap-1.5">
            <CloudUpload className="size-4" />
            <span>{t("saveDraft")}</span>
          </Button>
        )}
        {action.kind === "continue" && (
          <Button
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className="h-10 flex-1 cursor-pointer gap-1.5 bg-page-accent text-white hover:bg-page-accent/90"
          >
            {action.loading ? (
              spinner
            ) : (
              <>
                {action.label ?? t("continue")}
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        )}
        {action.kind === "submit" && (
          <Button
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            className="h-10 flex-1 cursor-pointer bg-page-accent text-white hover:bg-page-accent/90"
          >
            {action.loading ? spinner : (action.label ?? t("continue"))}
          </Button>
        )}
      </div>
    </div>
  );
}
