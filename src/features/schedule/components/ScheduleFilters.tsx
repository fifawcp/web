"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/shared/components/ui/drawer";

import { activeFilterCount } from "../lib/filterMatches";
import { DEFAULT_FILTERS, type ScheduleFilters as Filters, type Team } from "../types/schedule.types";

import { FilterControls } from "./FilterControls";
import { GoToTodayButton } from "./GoToTodayButton";

type Props = {
  filters: Filters;
  onChange: (next: Filters) => void;
  teams: Team[];
  tabs?: ReactNode;
  // Scroll to today's matches; omitted when there are none today (button hidden).
  onGoToToday?: () => void;
};

export function ScheduleFilters({ filters, onChange, teams, tabs, onGoToToday }: Props) {
  const t = useTranslations("schedule.filters");
  const locale = useLocale();
  const count = activeFilterCount(filters);

  return (
    // TODO: derive the offset dynamically from the header height instead of hardcoding 64px
    <div className="sticky top-16 z-20 bg-background">
      <div className="container">
        <div className="border-b border-border py-2">
          {/* Mobile: "go to today" sits above the filter trigger row. */}
          {onGoToToday && <GoToTodayButton onPress={onGoToToday} className="mb-2 w-full justify-center lg:hidden" />}

          <div className="hidden min-w-0 flex-wrap items-center gap-2 lg:flex">
            <FilterControls filters={filters} onChange={onChange} teams={teams} locale={locale} variant="chip" className="flex flex-wrap items-center gap-2" />
            {count > 0 && (
              <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)} className="h-8 cursor-pointer gap-1 text-xs text-muted-foreground">
                <X />
                {t("reset")}
              </Button>
            )}
            {/* Desktop: aligned to the right edge of the filter bar. */}
            {onGoToToday && <GoToTodayButton onPress={onGoToToday} className="ml-auto" />}
          </div>

          <MobileFilters filters={filters} onChange={onChange} teams={teams} locale={locale} count={count} />

          {tabs && <div className="mt-3">{tabs}</div>}
        </div>
      </div>
    </div>
  );
}

function MobileFilters({
  filters,
  onChange,
  teams,
  locale,
  count,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  teams: Team[];
  locale: string;
  count: number;
}) {
  const t = useTranslations("schedule.filters");
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <div className="flex w-full gap-2 lg:hidden">
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="flex-1 dark:bg-card dark:hover:bg-muted">
            <SlidersHorizontal />
            {t("openButton")}
            {count > 0 && (
              <Badge variant="secondary" className="ml-1">
                {count}
              </Badge>
            )}
          </Button>
        </DrawerTrigger>
        {count > 0 && (
          <Button variant="ghost" size="sm" className="flex-1 cursor-pointer text-muted-foreground" onClick={() => onChange(DEFAULT_FILTERS)}>
            <X />
            {t("reset")}
          </Button>
        )}
      </div>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("title")}</DrawerTitle>
          <DrawerDescription>{t("description")}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <FilterControls filters={filters} onChange={onChange} teams={teams} locale={locale} variant="stacked" className="grid grid-cols-1 gap-3" />
        </div>
        <DrawerFooter className="flex-row justify-between">
          <Button variant="ghost" size="sm" onClick={() => onChange(DEFAULT_FILTERS)} disabled={count === 0}>
            {t("reset")}
          </Button>
          <DrawerClose asChild>
            <Button size="sm" className="bg-page-accent text-background hover:bg-page-accent-strong">
              {t("done")}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
