import { Calendar, GitBranch, Settings, Trophy, UserPlus, Users, type LucideIcon } from "lucide-react";

/**
 * Single source of truth for the tutorial steps. Both the desktop
 * scrollytelling view (`TutorialScroller`) and the mobile card stack
 * (`TutorialMobile`) iterate over this list. i18n keys live under
 * `dashboard.tutorial.steps.<key>` in `messages/dashboard/{en,es}.json`.
 *
 * Screenshots are localised — each step has one `.webp` per supported
 * locale (`/public/tutorial/step-<locale>-<n>.webp`). `stepImageSrc`
 * builds the right path so the user sees screenshots that match the UI
 * language they're using.
 */

/** Locales that have tutorial screenshots. Falls back to `en` for
 *  anything not listed. Keep in sync with `i18n/routing.ts`. */
export const TUTORIAL_LOCALES = ["en", "es"] as const;
export type TutorialLocale = (typeof TUTORIAL_LOCALES)[number];

export type TutorialStep = {
  /** i18n key under `dashboard.tutorial.steps.*`. */
  key: "createAccount" | "joinOrCreateBoard" | "tournaments" | "customRules" | "pickems" | "schedule";
  /** Lucide icon shown next to the title. */
  icon: LucideIcon;
};

export const TUTORIAL_STEPS: readonly TutorialStep[] = [
  { key: "createAccount", icon: UserPlus },
  { key: "joinOrCreateBoard", icon: Users },
  { key: "tournaments", icon: Trophy },
  { key: "customRules", icon: Settings },
  { key: "pickems", icon: GitBranch },
  { key: "schedule", icon: Calendar },
] as const;

/**
 * Resolves the localised screenshot path for a step. `stepIndex` is
 * 0-based (matches the position in `TUTORIAL_STEPS`); the file naming
 * uses 1-based numbering to match the visible step badge.
 */
export function stepImageSrc(locale: string, stepIndex: number): string {
  const safeLocale: TutorialLocale = (TUTORIAL_LOCALES as readonly string[]).includes(locale) ? (locale as TutorialLocale) : "en";
  return `/tutorial/step-${safeLocale}-${stepIndex + 1}.webp`;
}
