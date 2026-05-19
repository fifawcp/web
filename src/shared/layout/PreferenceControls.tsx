"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { LANGUAGES, THEMES } from "@/shared/lib/preferences";
import { cn } from "@/shared/lib/utils";

/** Segmented light/dark theme control. Shared by PreferencesMenu and UserMenu. */
export function ThemeSwitch() {
  const t = useTranslations("preferences");
  const { theme, setTheme } = useTheme();

  const themeLabel: Record<string, string> = {
    light: t("themeLight"),
    dark: t("themeDark"),
  };

  return (
    <div className="flex rounded-md bg-muted p-0.5">
      {THEMES.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium transition-colors",
            theme === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="size-3.5" />
          {themeLabel[value]}
        </button>
      ))}
    </div>
  );
}

/** Locale picker — switches the NEXT_LOCALE cookie and reloads. Shared by PreferencesMenu and UserMenu. */
export function LanguageSwitch() {
  const { locale, changeLanguage, isPending } = useLanguage();

  return (
    <div className="flex flex-col">
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
  );
}
