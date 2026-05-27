"use client";

import { useState } from "react";
import { AtSign, Mail, Pencil, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { getInitials } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import type { EditableProfileFields } from "../api/profile";
import { formatJoinedDate } from "../lib/formatJoinedDate";
import type { UserRole } from "../types/profile.types";

import { EditProfileDialog } from "./EditProfileDialog";

type Props = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  role: UserRole;
};

/**
 * Page-level hero. Identity comes first because Profile is "you" — the
 * stats/picks/boards beneath it are framed as *your* state, not the
 * tournament's. The card uses the accent-tinted background flourish like
 * the dashboard's hero so the page reads as a player card on first glance.
 *
 * The "Edit details" button opens `EditProfileDialog`. Edits are optimistic:
 * a successful save updates the local `current` state immediately so the
 * card reflects the new name/username without waiting for a server round-
 * trip (currently a no-op placeholder; see `api/profile.ts`).
 */
export function IdentityHero({ username, firstName, lastName, email, createdAt, role }: Props) {
  const t = useTranslations("profile.identity");
  const locale = useLocale();

  // Local state seeded from props so the dialog's optimistic save can be
  // reflected without a full server refresh. When the backend endpoint
  // ships, swap this for `useQuery` against `/api/users/profile` seeded
  // with the server-fetched values from the page.
  const [current, setCurrent] = useState<EditableProfileFields>({
    first_name: firstName,
    last_name: lastName,
    username,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  const initials = getInitials(current.username, current.first_name, current.last_name);
  const fullName = [current.first_name, current.last_name].filter(Boolean).join(" ") || current.username;
  const joinedDate = formatJoinedDate(createdAt, locale);

  return (
    <>
      <article className="relative overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6">
        {/* Soft accent gradient — visible enough to feel like a banner, subtle
            enough that the avatar + text stay the focus. */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-br from-page-accent-soft via-card to-card opacity-70" />

        {/* Mobile: column with the action button below; sm+: row with the
            action button anchored to the top-right of the card so the
            "Edit details" affordance is always reachable without scrolling
            the identity content. */}
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-1 sm:flex-row sm:items-center sm:gap-6 sm:text-left">
            <Avatar className="size-20 shrink-0 ring-4 ring-card sm:size-24">
              <AvatarFallback className="bg-primary-foreground text-primary border border-border text-xl font-semibold dark:bg-primary dark:text-primary-foreground sm:text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-start">
                <h2 className="min-w-0 truncate text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{fullName}</h2>
                {role === "admin" && <RolePill label={t("adminBadge")} />}
              </div>

              {/* Meta rows — icon + value so each line carries a visual cue.
                  Stacks on mobile, becomes a single flex row at sm. */}
              <ul className="flex flex-col items-center gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
                <MetaItem icon={AtSign} value={current.username} />
                <MetaItem icon={Mail} value={email} />
              </ul>

              {/* Timezone-dependent — `Intl.DateTimeFormat` honours the runtime
                  timezone (server ≠ client), so suppress the hydration
                  warning. Post-hydration value (user's local date) is what
                  we want to show. */}
              <p className="text-xs text-muted-foreground" suppressHydrationWarning>
                {t("joinedLabel", { date: joinedDate })}
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5 self-center sm:self-start">
            <Pencil className="size-3.5" />
            {t("editDetails")}
          </Button>
        </div>
      </article>

      <EditProfileDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={current} onSaved={setCurrent} />
    </>
  );
}

function MetaItem({ icon: Icon, value }: { icon: typeof AtSign; value: string }) {
  return (
    <li className="flex min-w-0 items-center gap-1.5">
      <Icon aria-hidden className="size-3.5 shrink-0 text-muted-foreground/70" />
      <span className="truncate">{value}</span>
    </li>
  );
}

function RolePill({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-page-accent/30 bg-page-accent-soft px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider text-page-accent-strong"
      )}
    >
      <ShieldCheck className="size-3" />
      {label}
    </span>
  );
}
