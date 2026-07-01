"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import type { BracketMatchSlot } from "@/features/pickems/types/pickems.types";
import type { Team } from "@/shared/types/wcp.types";

import { renderBracketShareImage, type BracketShareTheme } from "../lib/bracketShareImage";
import { shareOrDownloadImage } from "../lib/shareImageFile";

/**
 * Orchestrates the simulator's Share action: render the current tree to a PNG,
 * then hand it to the platform share sheet (or download). Exposes a `share`
 * callback and an `isSharing` flag for button state. All UI strings flow through
 * `bracket.simulator.share`.
 */
export function useShareBracket(slots: BracketMatchSlot[], champion: Team | null) {
  const t = useTranslations("bracket.simulator.share");
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const [isSharing, setIsSharing] = useState(false);

  const share = useCallback(async () => {
    if (isSharing) return;
    setIsSharing(true);
    const toastId = toast.loading(t("generating"));
    try {
      const theme: BracketShareTheme = resolvedTheme === "dark" ? "dark" : "light";
      const blob = await renderBracketShareImage(slots, {
        locale,
        champion,
        theme,
        eyebrow: t("eyebrow"),
        title: t("imageTitle"),
        championLabel: t("championLabel"),
        thirdPlaceLabel: t("thirdPlaceLabel"),
        brand: "Pick'ems",
        year: "2026",
      });
      const result = await shareOrDownloadImage(blob, "world-cup-2026-bracket.png", {
        title: t("shareTitle"),
        text: `${t("shareText")} ${t("makeYours")} https://pickems.io/${locale}/bracket?view=simulate`,
      });
      toast.success(result === "downloaded" ? t("downloaded") : t("shared"), { id: toastId });
    } catch {
      toast.error(t("error"), { id: toastId });
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, slots, champion, locale, resolvedTheme, t]);

  return { share, isSharing };
}
