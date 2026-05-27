"use client";

import { ArrowLeft, ArrowRight, CloudUpload, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type { CTAAction } from "./PickemsCTABar";

type Props = {
  onBack?: () => void;
  onSaveDraft?: () => void;
  action: CTAAction;
};

/**
 * Inline action buttons rendered in the page header on desktop. Visibility is
 * controlled by the parent rail wrapper (which also lines up the progress bar
 * underneath these buttons).
 */
export function PickemsHeaderActions({ onBack, onSaveDraft, action }: Props) {
  const t = useTranslations("pickems.common");

  if (action.kind === "hidden" && !onBack && !onSaveDraft) return null;

  // Fixed-width buttons + a fixed-size spinner keep the row from reflowing when
  // labels swap to longer locales or the saving state kicks in.
  const spinner = <Loader2 className="size-4 animate-spin" aria-label={t("saving")} />;

  const isGated = action.kind !== "hidden" && !!action.disabled && !action.loading;
  const isLoading = action.kind !== "hidden" && !!action.loading;
  const gatedClass = isGated && "opacity-50 hover:bg-page-accent";

  return (
    <div className="flex items-center justify-end gap-2">
      {onBack && (
        <Button variant="outline" size="sm" onClick={onBack} className="w-44 cursor-pointer gap-1.5">
          <ArrowLeft className="size-4" />
          <span>{t("back")}</span>
        </Button>
      )}
      {onSaveDraft && (
        <Button variant="outline" size="sm" onClick={onSaveDraft} className="w-44 cursor-pointer gap-1.5">
          <CloudUpload className="size-3.5" />
          <span>{t("saveDraft")}</span>
        </Button>
      )}
      {action.kind === "continue" && (
        <Button
          size="sm"
          onClick={action.onClick}
          aria-disabled={isGated}
          disabled={isLoading}
          className={cn("w-44 cursor-pointer gap-1.5 bg-page-accent text-white hover:bg-page-accent/90", gatedClass)}
        >
          {isLoading ? (
            spinner
          ) : (
            <>
              {action.label ?? t("continue")}
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>
      )}
      {action.kind === "submit" && (
        <Button
          size="sm"
          onClick={action.onClick}
          aria-disabled={isGated}
          disabled={isLoading}
          className={cn("w-44 cursor-pointer bg-page-accent text-white hover:bg-page-accent/90", gatedClass)}
        >
          {isLoading ? spinner : (action.label ?? t("continue"))}
        </Button>
      )}
    </div>
  );
}
