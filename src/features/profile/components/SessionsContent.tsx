"use client";

import { useMemo, useState } from "react";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { logoutAndSignOut } from "@/features/auth/lib/logout";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";

import { useRevokeAllSessions, useRevokeSession, useSessions } from "../hooks/useSessions";
import type { Session } from "../types/profile.types";

import { SessionRow } from "./SessionRow";

/**
 * Active-session management — chrome-less variant for embedding inside the
 * `ManagementTabs` shell. Two destructive actions live in the header:
 *
 *   • **Sign out (this device)** — runs the standard logout pipeline
 *     (`logoutAndSignOut`) which clears the next-auth cookie and the
 *     upstream refresh token. Replaces the old standalone "Account" tab.
 *
 *   • **Sign out everywhere** — only rendered when there's more than one
 *     session; nukes every upstream session and signs the user out here.
 *
 * Per-row revoke shows up only on non-current devices; the dedicated
 * header button handles the current-device case with clearer language.
 *
 * Current device is detected via a most-recent-use heuristic — the
 * session being actively refreshed is, by definition, the one we're on.
 */
export function SessionsContent() {
  const t = useTranslations("profile.sessions");
  const { data: sessions, isLoading, isError } = useSessions();
  const revoke = useRevokeSession();
  const revokeAll = useRevokeAllSessions();
  const [signingOutThis, setSigningOutThis] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const { rows, currentId } = useMemo(() => orderSessions(sessions ?? []), [sessions]);

  const handleRevokeOther = async (id: string) => {
    try {
      await revoke.mutateAsync(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("revokeError"));
      throw e;
    }
  };

  const handleSignOutThis = async () => {
    if (signingOutThis) return;
    setSigningOutThis(true);
    await logoutAndSignOut("/login");
  };

  const handleSignOutAll = async () => {
    if (signingOutAll) return;
    setSigningOutAll(true);
    try {
      await revokeAll.mutateAsync();
      await logoutAndSignOut("/login");
    } catch (e) {
      setSigningOutAll(false);
      toast.error(e instanceof Error ? e.message : t("revokeAllError"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted-foreground">{t("subtitle")}</p>

      {isLoading && <SessionsListSkeleton />}
      {!isLoading && isError && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{t("loadError")}</p>}
      {!isLoading && !isError && rows.length === 0 && <EmptyState label={t("empty")} />}

      {!isLoading && !isError && rows.length > 0 && (
        <ul className="flex flex-col gap-2">
          {rows.map((session) => (
            <li key={session.id}>
              <SessionRow session={session} isCurrent={session.id === currentId} onRevoke={handleRevokeOther} />
            </li>
          ))}
        </ul>
      )}
      {/* Two destructive actions, stacked on mobile, inline at sm+. The
          "this device" option always shows; "everywhere" only when there
          are multiple sessions to nuke. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOutThis}
          disabled={signingOutThis}
          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-3.5" />
          {signingOutThis ? t("signingOutThis") : t("signOutThis")}
        </Button>
        {rows.length > 1 && (
          <Button variant="destructive" size="sm" onClick={handleSignOutAll} disabled={signingOutAll || revokeAll.isPending} className="gap-1.5">
            <LogOut className="size-3.5" />
            {signingOutAll ? t("signingOutAll") : t("signOutAll")}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Sort sessions newest-first by `last_used_at`. The first entry is treated
 * as the current device.
 */
function orderSessions(sessions: Session[]): { rows: Session[]; currentId: string | null } {
  const rows = [...sessions].sort((a, b) => new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime());
  return { rows, currentId: rows[0]?.id ?? null };
}

function SessionsListSkeleton() {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 sm:p-4">
          <Skeleton className="size-10 shrink-0 rounded-lg sm:size-11" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-8 w-20 shrink-0" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="rounded-lg border border-border bg-muted/40 px-3 py-4 text-center text-xs text-muted-foreground">{label}</p>;
}
