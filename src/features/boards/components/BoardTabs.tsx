"use client";

import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

export type BoardTabKey = "competitions" | "members";

type TabDef = { key: BoardTabKey; label: string };

type Props = {
  value: BoardTabKey;
  onValueChange: (value: BoardTabKey) => void;
  tabs: TabDef[];
  right?: React.ReactNode;
};

// Active-accent underline tabs matching the schedule screen, with an optional right-aligned toolbar
// (filter + New competition) that drops to a full-width row below on mobile.
const ACTIVE_ACCENT = cn(
  "data-active:text-page-accent dark:data-active:text-page-accent",
  "after:bg-page-accent",
  "data-active:hover:text-page-accent-strong dark:data-active:hover:text-page-accent-strong",
  "data-active:hover:after:bg-page-accent-strong"
);

export function BoardTabs({ value, onValueChange, tabs, right }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <Tabs value={value} onValueChange={(v) => onValueChange(v as BoardTabKey)}>
        <TabsList variant="line" className="w-full justify-start gap-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className={cn("flex-none cursor-pointer px-0.5", ACTIVE_ACCENT)}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}
