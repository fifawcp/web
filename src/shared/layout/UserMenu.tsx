"use client";

import { useState, useTransition } from "react";
import { Check, ChevronRight, LogOut, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { logoutAndSignOut } from "@/features/auth/lib/logout";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { getInitials } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

import { Button } from "../components/ui/button";

type UserMenuProps = {
  username: string;
  firstName?: string;
  lastName?: string;
};

const THEMES = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
] as const;

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

export function UserMenu({ username, firstName, lastName }: UserMenuProps) {
  const t = useTranslations("userMenu");
  const tPref = useTranslations("preferences");
  const tLang = useTranslations("language");
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initials = getInitials(username, firstName, lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || username;

  const handleSignOut = async () => {
    setLoading(true);
    await logoutAndSignOut("/");
  };

  const changeLanguage = (next: string) => {
    if (next === locale) return;
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  const themeLabel: Record<string, string> = {
    light: tPref("themeLight"),
    dark: tPref("themeDark"),
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("accountMenu")}
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="size-9 cursor-pointer">
            <AvatarFallback className="bg-primary-foreground text-primary border border-border dark:bg-primary dark:text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
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
          <Link href={"/profile"} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted">
            <User className="size-4 shrink-0 text-muted-foreground" />
            <span className="flex-1">{t("profile")}</span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
          </Link>
        </div>

        {/* Appearance */}
        <div className="border-t border-border px-1.5 pt-2 pb-1.5">
          <span className="px-1 pb-1.5 block text-2xs font-medium uppercase tracking-wider text-muted-foreground">{tPref("appearance")}</span>
          <div className="grid grid-cols-2 gap-1">
            {THEMES.map(({ value, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md border py-2 text-2xs font-medium transition-colors",
                  theme === value ? "border-border bg-muted text-foreground" : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {themeLabel[value]}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="border-t border-border px-1.5 pt-2 pb-1.5">
          <span className="px-1 pb-1 block text-2xs font-medium uppercase tracking-wider text-muted-foreground">{tLang("label")}</span>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              disabled={isPending}
              className="flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-50"
            >
              <span className="w-5 text-2xs font-semibold uppercase text-muted-foreground">{lang.code}</span>
              <span className="flex-1 text-left">{lang.label}</span>
              {lang.code === locale && <Check className="size-4" />}
            </button>
          ))}
        </div>

        {/* Sign out */}
        <div className="border-t border-border p-1.5">
          <Button
            onClick={handleSignOut}
            disabled={loading}
            variant="outline"
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors hover:bg-destructive/15 disabled:opacity-50 dark:hover:bg-destructive/25"
          >
            <LogOut className="size-4 shrink-0" />
            <span className="flex-1 text-left">{loading ? t("signingOut") : t("signOut")}</span>
            <ChevronRight className="size-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
