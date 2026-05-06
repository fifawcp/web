"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";
import { IconButton } from "@/shared/components/ui/icon-button";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

export function LanguageToggle() {
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === locale) return;
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton aria-label="Change language" disabled={isPending}>
          <Globe className="h-5 w-5 text-foreground" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="left" align="start" sideOffset={8} className="min-w-44">
        <DropdownMenuRadioGroup value={locale} onValueChange={handleLanguageChange}>
          {LANGUAGES.map((lang) => (
            <DropdownMenuRadioItem key={lang.code} value={lang.code} disabled={isPending}>
              {lang.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
