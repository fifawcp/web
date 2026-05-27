"use client";

import { useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";

/** Current locale + a switcher that swaps the URL locale prefix, keeping path & query. */
export function useLanguage() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const changeLanguage = (next: string) => {
    if (next === locale) return;
    const qs = searchParams.toString();
    const href = qs ? `${pathname}?${qs}` : pathname;
    startTransition(() => {
      router.replace(href, { locale: next });
    });
  };

  return { locale, changeLanguage, isPending };
}
