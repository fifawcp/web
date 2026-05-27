"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

import { useHydrated } from "@/shared/hooks/useHydrated";
import { useLanguage } from "@/shared/hooks/useLanguage";
import { LANGUAGES, THEMES } from "@/shared/lib/preferences";
import { cn } from "@/shared/lib/utils";

type SwitchVariant = "compact" | "expanded";

type SwitchProps = {
  /** `compact` keeps a fixed 144px track with icon/code-only pills (mobile drawer);
   *  `expanded` fills its parent width and shows icon+label / code+language name (desktop popover). */
  variant?: SwitchVariant;
};

// True segmented control — one track, two equal-flex tiles, one active "raised"
// tile. Active state tints with the route accent so the selected option recolors
// when the user navigates between routes.
const pillButton = "flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-50";
const pillActive = "bg-card text-page-accent-strong shadow-sm ring-1 ring-page-accent/20";
const pillInactive = "text-muted-foreground hover:text-foreground";

const trackCompact = "inline-flex w-36 shrink-0 rounded-md bg-muted p-0.5";
const trackExpanded = "flex w-full rounded-md bg-muted p-0.5";

/**
 * Segmented light/dark theme control. Variant decides icon-only vs icon+label.
 *
 * `next-themes` returns `undefined` for `theme` during SSR and the real
 * value on the client, which would flip `aria-pressed` + the active class
 * between renders and trigger a hydration warning. We gate the active
 * state on `useHydrated` so the server renders every button as inactive
 * (deterministic) and the client swaps to the real selection after mount.
 */
export function ThemeSwitch({ variant = "compact" }: SwitchProps = {}) {
  const t = useTranslations("preferences");
  // `resolvedTheme` collapses "system" → the concrete "light"/"dark" the OS reports,
  // so the right pill highlights when no preference is saved. `theme` would be "system".
  // Gate on `useHydrated`: `resolvedTheme` is `undefined` during SSR (next-themes
  // can't read the OS preference on the server), which would flip `aria-pressed`
  // + the active class between server and client renders and trip a hydration
  // warning. Server renders all buttons inactive; client swaps on mount.
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const activeTheme = hydrated ? resolvedTheme : undefined;

  const themeLabel: Record<string, string> = {
    light: t("themeLight"),
    dark: t("themeDark"),
  };

  return (
    <div className={variant === "expanded" ? trackExpanded : trackCompact}>
      {THEMES.map(({ value, icon: Icon }) => {
        const isActive = activeTheme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={isActive}
            aria-label={themeLabel[value]}
            className={cn(pillButton, isActive ? pillActive : pillInactive)}
          >
            <Icon className="size-4" />
            {variant === "expanded" && <span>{themeLabel[value]}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Segmented locale picker. Variant decides code-only vs code + language name. */
export function LanguageSwitch({ variant = "compact" }: SwitchProps = {}) {
  const { locale, changeLanguage, isPending } = useLanguage();

  return (
    <div className={variant === "expanded" ? trackExpanded : trackCompact}>
      {LANGUAGES.map((lang) => {
        const isActive = lang.code === locale;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => changeLanguage(lang.code)}
            disabled={isPending}
            aria-pressed={isActive}
            className={cn(pillButton, isActive ? pillActive : pillInactive)}
          >
            {variant === "expanded" ? (
              <span>
                <span className="font-mono uppercase tracking-wider">{lang.code}</span> - {lang.label}
              </span>
            ) : (
              <span className="font-mono text-2xs uppercase tracking-wider">{lang.code}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
