"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Button } from "@/shared/components/ui/button";

import { UserMenu } from "./UserMenu";

type HeaderUser = { username: string; firstName?: string; lastName?: string };

/**
 * Auth-dependent slot of the desktop header (avatar menu vs. Sign In).
 *
 * The server passes `initialUser` for a correct, flash-free first paint, but
 * once mounted this tracks the **client** session via `useSession()`. That's
 * what makes the avatar appear the instant `signIn` resolves — the `Header` is
 * a server component in a shared layout, so relying on a `router.refresh()`
 * round-trip to update it left the navbar on its logged-out render for a
 * noticeable beat after login (issue #61). `useSession` updates client-side
 * immediately, no server round-trip.
 */
export function HeaderAuth({ initialUser }: { initialUser: HeaderUser | null }) {
  const t = useTranslations("nav");
  const { data, status } = useSession();

  // "loading" → trust the server value (matches SSR, avoids a hydration flip);
  // once resolved, the live client session wins.
  const user =
    status === "authenticated" && data?.user
      ? { username: data.user.username, firstName: data.user.first_name, lastName: data.user.last_name }
      : status === "unauthenticated"
        ? null
        : initialUser;

  return user ? (
    <UserMenu username={user.username} firstName={user.firstName} lastName={user.lastName} />
  ) : (
    <Button asChild size="sm" variant="ghost">
      <Link href="/login">{t("login")}</Link>
    </Button>
  );
}
