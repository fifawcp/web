"use client";

import { useState, useTransition } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

import { IconButton } from "@/shared/components/ui/icon-button";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
] as const;

export function LanguageToggle() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false);
    } else {
      startTransition(() => {
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
        window.location.reload();
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <IconButton onClick={() => setIsOpen(!isOpen)} aria-label="Change language" disabled={isPending}>
        <Globe className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />
      </IconButton>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-1 w-auto bg-white dark:bg-zinc-900 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-800 z-20">
            <div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={isPending}
                  className={`cursor-pointer w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-3 transition-colors leading-none ${
                    locale === lang.code ? "bg-zinc-100 dark:bg-zinc-800" : ""
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span className="text-zinc-900 dark:text-zinc-100 ">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
