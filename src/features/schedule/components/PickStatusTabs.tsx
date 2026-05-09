"use client";

import { useTranslations } from "next-intl";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

import type { PickFilter } from "../types/schedule.types";

type Counts = Record<PickFilter, number>;

type Props = {
  value: PickFilter;
  onChange: (next: PickFilter) => void;
  counts: Counts;
};

const ORDER: PickFilter[] = ["all", "pending", "picked"];

const ACTIVE_ACCENT = cn(
  "data-active:text-page-accent dark:data-active:text-page-accent",
  "after:bg-page-accent",
  "data-active:hover:text-page-accent-strong dark:data-active:hover:text-page-accent-strong",
  "data-active:hover:after:bg-page-accent-strong"
);

export function PickStatusTabs({ value, onChange, counts }: Props) {
  const t = useTranslations("schedule.tabs");

  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as PickFilter)}>
      <TabsList variant="line" className="w-full justify-start gap-2">
        {ORDER.map((key) => {
          const isActive = key === value;
          return (
            <TabsTrigger key={key} value={key} className={cn("flex-1 cursor-pointer lg:flex-none lg:min-w-40", ACTIVE_ACCENT)}>
              <span>{t(key)}</span>
              <span className={cn("ml-1.5 text-xs tabular-nums", isActive ? "text-page-accent" : "text-muted-foreground")}>{counts[key]}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
