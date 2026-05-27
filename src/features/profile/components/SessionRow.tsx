"use client";

import { useState } from "react";
import { Loader2, Monitor, Smartphone, Tablet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { formatLastUsed } from "../lib/formatLastUsed";
import { parseUserAgent } from "../lib/parseUserAgent";
import type { Session } from "../types/profile.types";

type Props = {
  session: Session;
  /** True for the device the user is currently on. Current-device rows skip the
   *  per-row revoke button — the dedicated "Sign out this device" header
   *  button covers that flow with clearer language. */
  isCurrent: boolean;
  /** Revoke handler. Returns when the network call settles. */
  onRevoke: (id: string) => Promise<void>;
};

/**
 * One device row inside the sessions list. Each row is its own bordered
 * sub-card with breathing room — readable on mobile (icon + label + meta
 * stack vertically inside), comfortable on desktop (icon on the left,
 * meta stacked next to it, revoke button on the right).
 *
 * Current device: stronger accent background, "This device" pill, no
 * revoke button. Other devices: muted background, ghost-styled revoke
 * that turns destructive on hover so the page doesn't read as a wall of
 * red.
 */
export function SessionRow({ session, isCurrent, onRevoke }: Props) {
  const t = useTranslations("profile.sessions");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const device = parseUserAgent(session.user_agent);
  const Icon = device.kind === "mobile" ? Smartphone : device.kind === "tablet" ? Tablet : Monitor;
  const lastUsed = formatLastUsed(session.last_used_at, locale);

  const handleRevoke = async () => {
    setLoading(true);
    try {
      await onRevoke(session.id);
    } catch {
      // Parent surfaces the toast via the mutation `onError`.
      setLoading(false);
    }
  };

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4",
        isCurrent ? "border-page-accent/40 bg-page-accent-soft/60" : "border-border bg-card"
      )}
    >
      {/* Icon + meta row. On mobile this is the full width of the card;
          on sm+ it sits alongside the action button. */}
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg sm:size-11",
            isCurrent ? "bg-card text-page-accent-strong ring-1 ring-page-accent/30" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-4 sm:size-5" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="truncate text-sm font-semibold text-foreground">{device.label}</span>
            {isCurrent && (
              <span className="inline-flex items-center rounded-full border border-page-accent/40 bg-page-accent-soft px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-page-accent-strong">
                {t("thisDevice")}
              </span>
            )}
          </div>
          {/* IP + last used. Stacks below sm so the relative-time string
              has room to render without truncation. No `truncate` on the
              wrapped values so a long "X minutes ago" wraps to 2 lines
              instead of clipping. */}
          <div className="flex flex-col text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-1.5">
            <span>{session.ip_address}</span>
            <span aria-hidden className="hidden text-muted-foreground/40 sm:inline">
              ·
            </span>
            <span suppressHydrationWarning>{t("lastUsed", { when: lastUsed })}</span>
          </div>
        </div>
      </div>

      {!isCurrent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRevoke}
          disabled={loading}
          className="shrink-0 self-end text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-60 sm:self-auto"
          aria-label={t("revokeAria", { device: device.label })}
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : t("revoke")}
        </Button>
      )}
    </article>
  );
}
