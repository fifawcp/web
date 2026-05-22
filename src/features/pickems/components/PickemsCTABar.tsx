"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CloudUpload, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export type CTAAction =
  | { kind: "hidden" }
  | { kind: "continue"; label?: string; disabled?: boolean; loading?: boolean; helperText?: string; helperTone?: "ready"; onClick: () => void }
  | { kind: "submit"; label?: string; disabled?: boolean; loading?: boolean; helperText?: string; helperTone?: "ready"; onClick: () => void };

type Props = {
  onBack?: () => void;
  onSaveDraft?: () => void;
  action: CTAAction;
  progress?: { completed: number; total: number };
};

export function PickemsCTABar({ onBack, onSaveDraft, action, progress }: Props) {
  const t = useTranslations("pickems.common");
  const ref = useRef<HTMLDivElement>(null);

  // Expose the bar's measured height (incl. safe-area padding) as a CSS var so
  // the route layout can match body padding-bottom to it exactly — otherwise a
  // static padding value leaves a visible gap between the global footer and
  // the bar whenever the bar is shorter than the reserved space.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = () => document.body.style.setProperty("--pickems-cta-height", `${el.offsetHeight}px`);
    write();
    const ro = new ResizeObserver(write);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.body.style.removeProperty("--pickems-cta-height");
    };
  }, []);

  if (action.kind === "hidden" && !onBack && !onSaveDraft) return null;

  const spinner = <Loader2 className="size-4 animate-spin" aria-label={t("saving")} />;
  const helperText = action.kind !== "hidden" ? action.helperText : undefined;
  const helperTone = action.kind !== "hidden" ? action.helperTone : undefined;
  const showProgress = !!progress && progress.total > 0;
  const percent = progress && progress.total > 0 ? Math.min(100, (progress.completed / progress.total) * 100) : 0;

  // `disabled` = muted but still clickable (handler shows a toast). `loading` = HTML-disabled + spinner.
  const isGated = action.kind !== "hidden" && !!action.disabled && !action.loading;
  const isLoading = action.kind !== "hidden" && !!action.loading;
  const gatedClass = isGated && "opacity-50 hover:bg-page-accent";

  return (
    <div
      ref={ref}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background py-3 lg:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      {(helperText || showProgress) && (
        <div className="container space-y-1.5 pb-2">
          {helperText && (
            <p
              className={cn(
                "flex items-center justify-center gap-1.5 text-center text-xs font-medium",
                helperTone === "ready" ? "text-page-accent-strong" : "text-muted-foreground"
              )}
            >
              {helperTone === "ready" && <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />}
              <span>{helperText}</span>
            </p>
          )}
          {showProgress && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-page-accent transition-all" style={{ width: `${percent}%` }} />
            </div>
          )}
        </div>
      )}
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
            aria-disabled={isGated}
            disabled={isLoading}
            className={cn("h-10 flex-1 cursor-pointer gap-1.5 bg-page-accent text-white hover:bg-page-accent/90", gatedClass)}
          >
            {isLoading ? (
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
            aria-disabled={isGated}
            disabled={isLoading}
            className={cn("h-10 flex-1 cursor-pointer bg-page-accent text-white hover:bg-page-accent/90", gatedClass)}
          >
            {isLoading ? spinner : (action.label ?? t("continue"))}
          </Button>
        )}
      </div>
    </div>
  );
}
