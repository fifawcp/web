"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { useLanguage } from "@/shared/hooks/useLanguage";
import { LANGUAGES, THEMES } from "@/shared/lib/preferences";
import { cn } from "@/shared/lib/utils";

/** Segmented light/dark theme control. Shared by PreferencesMenu and UserMenu. */
const buttonClass = "flex flex-1 items-center justify-center gap-1.5 rounded py-1.5 text-xs font-medium transition-colors";
export function ThemeSwitch() {
  const t = useTranslations("preferences");
  const { theme, setTheme } = useTheme();

  const themeLabel: Record<string, string> = {
    light: t("themeLight"),
    dark: t("themeDark"),
  };

  return (
    <div className="flex flex-1 rounded-md bg-muted p-0.5">
      {THEMES.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(buttonClass, theme === value ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground")}
        >
          <Icon className="size-3.5" />
          <span className="hidden lg:inline">{themeLabel[value]}</span>
        </button>
      ))}
    </div>
  );
}

/** Segmented locale picker — same shape as ThemeSwitch for visual parity. */
export function LanguageSwitch() {
  const { locale, changeLanguage, isPending } = useLanguage();

  return (
    <div className="flex flex-1 rounded-md bg-muted p-0.5">
      {LANGUAGES.map((lang) => {
        const isActive = lang.code === locale;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => changeLanguage(lang.code)}
            disabled={isPending}
            aria-pressed={isActive}
            className={cn(
              buttonClass,
              "disabled:opacity-50",
              isActive ? "bg-background text-foreground shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="font-mono text-2xs uppercase tracking-wider opacity-70">{lang.code}</span>
            <span className="hidden lg:inline">{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
}
