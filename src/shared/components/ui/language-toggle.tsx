"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/lib/utils";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

type LanguageToggleProps = {
  className?: string;
};

export function LanguageToggle({ className }: LanguageToggleProps) {
  const locale = useLocale();
  const t = useTranslations("language");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = (next: string) => {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          aria-label={t("label")}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50",
            className
          )}
        >
          <Globe className="size-4 text-muted-foreground" />
          <span className="uppercase">{locale}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 gap-0 p-1.5">
        <span className="px-2 pb-1 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("label")}</span>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleChange(lang.code)}
            disabled={isPending}
            className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-50"
          >
            <span className="w-5 text-2xs font-semibold uppercase text-muted-foreground">{lang.code}</span>
            <span className="flex-1 text-left">{lang.label}</span>
            {lang.code === locale && <Check className="size-4" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
