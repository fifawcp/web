"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { logoutAndSignOut } from "@/features/auth/lib/logout";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { getInitials } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import { LanguageSwitch, ThemeSwitch } from "./PreferenceControls";

type UserMenuProps = {
  username: string;
  firstName?: string;
  lastName?: string;
};

export function UserMenu({ username, firstName, lastName }: UserMenuProps) {
  const t = useTranslations("userMenu");
  const tPref = useTranslations("preferences");
  const tLang = useTranslations("language");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const initials = getInitials(username, firstName, lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || username;

  const handleSignOut = async () => {
    setLoading(true);
    await logoutAndSignOut("/");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("accountMenu")}
          className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 transition-colors hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary-foreground text-primary border border-border text-xs dark:bg-primary dark:text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className={cn("size-3 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="mt-1 w-64 gap-0 p-0">
        {/* Identity card */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          <Avatar className="size-10 shrink-0">
            <AvatarFallback className="bg-primary-foreground text-primary border border-border dark:bg-primary dark:text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">{fullName}</span>
            <span className="truncate text-xs text-muted-foreground">@{username}</span>
          </div>
        </div>

        {/* Nav rows */}
        <div className="p-1.5">
          <Link href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted">
            <User className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">{t("profile")}</span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
          </Link>
        </div>

        {/* Theme — `expanded` variant fills the popover width and shows
            icon + label on each pill. */}
        <div className="border-t border-border p-2">
          <span className="px-1 pb-1.5 block text-2xs font-medium uppercase tracking-wider text-muted-foreground">{tPref("theme")}</span>
          <ThemeSwitch variant="expanded" />
        </div>

        {/* Language — same `expanded` treatment: code · language name. */}
        <div className="p-2">
          <span className="px-1 pb-1 block text-2xs font-medium uppercase tracking-wider text-muted-foreground">{tLang("label")}</span>
          <LanguageSwitch variant="expanded" />
        </div>

        {/* Sign out — destructive text, hover swaps to the theme-aware destructive-hover var */}
        <div className="border-t border-border p-1.5">
          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive-hover disabled:opacity-50"
          >
            <LogOut className="size-4 shrink-0" />
            <span className="flex-1 text-left">{loading ? t("signingOut") : t("signOut")}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
