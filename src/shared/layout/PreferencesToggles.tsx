"use client";

import { ChevronDown, Globe, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useHydrated } from "@/shared/hooks/useHydrated";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { LANGUAGES } from "@/shared/lib/preferences";

/**
 * Inline preferences cluster: a one-tap theme **toggle** button and a language
 * **dropdown**. Used on the desktop header (guest + authed) and the auth-page
 * preferences corner. Mobile keeps the bundled controls inside the drawer
 * (`MobileMenu`), so these stay desktop-only by virtue of where they're placed.
 */
export function PreferencesToggles() {
  return (
    <div className="flex items-center gap-1">
      <ThemeToggleButton />
      <LanguageDropdown />
    </div>
  );
}

function ThemeToggleButton() {
  const t = useTranslations("preferences");
  // `resolvedTheme` collapses "system" → the concrete light/dark the OS reports.
  // Gate on `useHydrated`: it's `undefined` during SSR, so the first client
  // render must match the server (neutral) and swap to the real icon on mount —
  // otherwise React logs a hydration mismatch on the icon.
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const isDark = hydrated && resolvedTheme === "dark";

  return (
    <Button type="button" variant="ghost" size="icon-sm" aria-label={t(isDark ? "themeLight" : "themeDark")} onClick={() => setTheme(isDark ? "light" : "dark")}>
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}

function LanguageDropdown() {
  const tLang = useTranslations("language");
  const { locale, changeLanguage, isPending } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="sm" aria-label={tLang("label")} disabled={isPending} className="group gap-1.5">
          <Globe className="size-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">{locale}</span>
          <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuLabel className="text-2xs tracking-wider uppercase text-muted-foreground">{tLang("label")}</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={locale} onValueChange={changeLanguage}>
          {LANGUAGES.map((lang) => (
            <DropdownMenuRadioItem key={lang.code} value={lang.code} disabled={isPending}>
              <span className="w-5 shrink-0 font-mono text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{lang.code}</span>
              <span className="font-medium">{lang.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
