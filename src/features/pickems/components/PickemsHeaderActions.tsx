"use client";

import { ArrowLeft, ArrowRight, CloudUpload, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";

import type { CTAAction } from "./PickemsCTABar";

type Props = {
  onBack?: () => void;
  onSaveDraft?: () => void;
  action: CTAAction;
};

/**
 * Inline action buttons rendered in the page header on desktop. Mobile uses
 * the fixed-bottom `PickemsCTABar` instead — this component hides itself
 * below `lg:`.
 */
export function PickemsHeaderActions({ onBack, onSaveDraft, action }: Props) {
  const t = useTranslations("pickems.common");

  if (action.kind === "hidden" && !onBack && !onSaveDraft) return null;

  // Spinner-not-text: the button's `min-w-*` only enforces a *minimum*, so a
  // "Guardando..." label was wider than "Paso 2 →" and made the button grow
  // visibly on every lock click. A fixed-size icon keeps width stable.
  const spinner = <Loader2 className="size-4 animate-spin" aria-label={t("saving")} />;

  return (
    <div className="hidden items-center justify-end gap-2 lg:flex">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="cursor-pointer gap-1.5">
          <ArrowLeft className="size-4" />
          <span>{t("back")}</span>
        </Button>
      )}
      {onSaveDraft && (
        <Button variant="outline" size="sm" onClick={onSaveDraft} className="min-w-32 cursor-pointer gap-1.5 px-5">
          <CloudUpload className="size-3.5" />
          <span>{t("saveDraft")}</span>
        </Button>
      )}
      {action.kind === "continue" && (
        <Button
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className="min-w-28 cursor-pointer gap-1.5 bg-page-accent px-5 text-white hover:bg-page-accent/90"
        >
          {action.loading ? (
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
          disabled={action.disabled || action.loading}
          className="min-w-32 cursor-pointer bg-page-accent px-5 text-white hover:bg-page-accent/90"
        >
          {action.loading ? spinner : (action.label ?? t("continue"))}
        </Button>
      )}
    </div>
  );
}
