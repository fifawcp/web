"use client";

import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";

import { LanguageSwitch, ThemeSwitch } from "./PreferenceControls";

/** Single header control that bundles theme + language so the bar stays uncluttered. */
export function PreferencesMenu() {
  const t = useTranslations("preferences");
  const tLang = useTranslations("language");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button aria-label={t("title")} size="sm" variant="outline" className="flex items-center justify-center rounded-md p-2">
          <Settings className="size-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="mt-1 w-48 gap-0 p-2">
        <span className="px-1 pb-1.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("theme")}</span>
        <ThemeSwitch />

        <div className="my-2 border-t border-border" />

        <span className="px-1 pb-1.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{tLang("label")}</span>
        <LanguageSwitch />
      </PopoverContent>
    </Popover>
  );
}
