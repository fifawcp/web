"use client";

import { ArrowLeft, ArrowRight, CloudUpload } from "lucide-react";
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

/**
 * Mobile fixed-bottom action bar. Desktop uses `PickemsHeaderActions` which
 * lives in the page header's right slot instead — this component hides itself
 * above `lg:`.
 *
 * `PickemsView` adds `pb-28` to the page container so the last group / tile /
 * bracket card isn't covered by this bar on mobile.
 */
export function PickemsCTABar({ onBack, onSaveDraft, action }: Props) {
  const t = useTranslations("pickems.common");

  if (action.kind === "hidden" && !onBack && !onSaveDraft) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 m-0 border-t border-border bg-background px-4 py-3 lg:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      {action.kind !== "hidden" && action.helperText && <p className="pb-2 text-center text-2xs text-muted-foreground">{action.helperText}</p>}
      <div className="mx-auto flex max-w-7xl items-center gap-2">
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
              t("saving")
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
            {action.loading ? t("saving") : (action.label ?? t("continue"))}
          </Button>
        )}
      </div>
    </div>
  );
}
