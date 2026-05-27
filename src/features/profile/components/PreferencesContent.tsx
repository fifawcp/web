"use client";

import { useTranslations } from "next-intl";

import { LanguageSwitch, ThemeSwitch } from "@/shared/layout/PreferenceControls";

/**
 * Theme + language picker — chrome-less variant for embedding inside the
 * `ManagementTabs` shell. The interactive segmented controls are reused
 * verbatim from `shared/layout/PreferenceControls` so any future visual
 * tweak there propagates here and inside the `UserMenu` popover.
 *
 * Layout: stacks on mobile, side-by-side at sm+. The two-column grid keeps
 * each segmented control compact instead of stretching one 4-button track
 * across the full desktop width.
 */
export function PreferencesContent() {
  const t = useTranslations("profile.preferences");

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("themeLabel")}</span>
        <ThemeSwitch variant="expanded" />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("languageLabel")}</span>
        <LanguageSwitch variant="expanded" />
      </div>
    </div>
  );
}
