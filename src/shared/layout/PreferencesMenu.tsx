"use client";

import { useState, useTransition } from "react";
import { Check, Moon, Settings, Sun } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

import { Button } from "../components/ui/button";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

const THEMES = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
] as const;

/** Single header control that bundles appearance + language so the bar stays uncluttered. */
export function PreferencesMenu() {
  const t = useTranslations("preferences");
  const tLang = useTranslations("language");
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const themeLabel: Record<string, string> = {
    light: t("themeLight"),
    dark: t("themeDark"),
  };

  const changeLanguage = (next: string) => {
    if (next === locale) return;
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button aria-label={t("title")} size={"sm"} variant="outline" className="flex items-center justify-center rounded-md p-2">
          <Settings className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 gap-0 p-2 mt-1">
        <span className="px-1 pb-1.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("appearance")}</span>
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

        <div className="my-2 border-t border-border" />

        <span className="px-1 pb-1.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{tLang("label")}</span>
        <div className="flex flex-col">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              disabled={isPending}
              className="flex items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-50"
            >
              <span className="w-5 text-2xs font-semibold uppercase text-muted-foreground">{lang.code}</span>
              <span className="flex-1 text-left">{lang.label}</span>
              {lang.code === locale && <Check className="size-4" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
