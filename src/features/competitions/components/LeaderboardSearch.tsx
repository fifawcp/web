"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { cn } from "@/shared/lib/utils";

const Q_PARAM = "q";
const PAGE_PARAM = "page";

// Leaderboard search, lifted out of the table card. Owns the input + debounce and syncs `?q` to the
// URL; the table reads `?q` back, so the two stay decoupled.
export function LeaderboardSearch({ className }: { className?: string }) {
  const t = useTranslations("competitions.leaderboard");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get(Q_PARAM) ?? "";
  const [inputValue, setInputValue] = useState(urlQuery);
  const debouncedQuery = useDebounce(inputValue.trim(), 300);

  useEffect(() => {
    if (debouncedQuery === urlQuery) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedQuery) next.set(Q_PARAM, debouncedQuery);
    else next.delete(Q_PARAM);
    next.delete(PAGE_PARAM);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [debouncedQuery, urlQuery, searchParams, router, pathname]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        type="search"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        placeholder={t("search")}
        className="pl-9"
        aria-label={t("search")}
      />
      {inputValue ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setInputValue("")}
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground"
          aria-label={t("search")}
        >
          <X className="size-3.5" aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
