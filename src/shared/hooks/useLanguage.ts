"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Current locale plus a cookie-backed switcher that reloads to apply the change. */
export function useLanguage() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const changeLanguage = (next: string) => {
    if (next === locale) return;
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}`;
      window.location.reload();
    });
  };

  return { locale, changeLanguage, isPending };
}
