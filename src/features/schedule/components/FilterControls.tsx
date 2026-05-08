"use client";

import { useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { cn } from "@/shared/lib/utils";

import type { GroupCode, ScheduleFilters, StageCode, Team } from "../types/schedule.types";

import { CHIP_TRIGGER_CLASS } from "./chipStyles";
import { TeamCombobox } from "./TeamCombobox";

const STAGE_OPTIONS: StageCode[] = ["group_stage", "round_of_32", "round_of_16", "quarterfinals", "semifinals", "third_place", "final"];
const GROUP_OPTIONS: GroupCode[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// Each chip has a fixed width sized to the longest "Label: Value" combo it can
// render in either locale, so the bar layout never shifts when a value changes
const CHIP_WIDTH = {
  stage: "w-44",
  group: "w-32",
  team: "w-60",
  status: "w-44",
} as const;

type Props = {
  filters: ScheduleFilters;
  onChange: (next: ScheduleFilters) => void;
  teams: Team[];
  locale: string;
  variant?: "chip" | "stacked";
  className?: string;
};

// "chip" packs label + value into a single rounded trigger (desktop bar)
// "stacked" puts the label above a full-width Select (mobile drawer)
export function FilterControls({ filters, onChange, teams, locale, variant = "chip", className }: Props) {
  const t = useTranslations("schedule.filters");
  const groupDisabled = filters.stage !== "group_stage" && filters.stage !== "all";

  return (
    <div className={className}>
      <FilterField label={t("stage.label")} variant={variant}>
        <Select value={filters.stage} onValueChange={(v) => onChange({ ...filters, stage: v as ScheduleFilters["stage"] })}>
          <ChipOrStackedTrigger label={t("stage.label")} variant={variant} widthClass={CHIP_WIDTH.stage} />
          <DropdownContent>
            <SelectItem value="all">{t("stage.all")}</SelectItem>
            {STAGE_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {t(`stage.${s}`)}
              </SelectItem>
            ))}
          </DropdownContent>
        </Select>
      </FilterField>

      <FilterField label={t("group.label")} variant={variant}>
        <Select value={filters.group} onValueChange={(v) => onChange({ ...filters, group: v as ScheduleFilters["group"] })} disabled={groupDisabled}>
          <ChipOrStackedTrigger label={t("group.label")} variant={variant} widthClass={CHIP_WIDTH.group} />
          <DropdownContent>
            <SelectItem value="all">{t("group.all")}</SelectItem>
            {GROUP_OPTIONS.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </DropdownContent>
        </Select>
      </FilterField>

      <FilterField label={t("team.label")} variant={variant}>
        <TeamCombobox
          value={filters.team}
          onChange={(team) => onChange({ ...filters, team })}
          teams={teams}
          locale={locale}
          variant={variant}
          widthClass={variant === "chip" ? CHIP_WIDTH.team : "w-full"}
        />
      </FilterField>

      <FilterField label={t("matchStatus.label")} variant={variant}>
        <Select value={filters.matchStatus} onValueChange={(v) => onChange({ ...filters, matchStatus: v as ScheduleFilters["matchStatus"] })}>
          <ChipOrStackedTrigger label={t("matchStatus.label")} variant={variant} widthClass={CHIP_WIDTH.status} />
          <DropdownContent>
            <SelectItem value="all">{t("matchStatus.all")}</SelectItem>
            <SelectItem value="scheduled">{t("matchStatus.scheduled")}</SelectItem>
            <SelectItem value="finished">{t("matchStatus.finished")}</SelectItem>
          </DropdownContent>
        </Select>
      </FilterField>
    </div>
  );
}

function FilterField({ label, variant, children }: { label: string; variant: "chip" | "stacked"; children: React.ReactNode }) {
  if (variant === "chip") return <>{children}</>;
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
      <span>{label}</span>
      {children}
    </label>
  );
}

// Renders the Select trigger appropriate to the variant. The chip trigger
// always shows the "Label: Value" pair (truncated if needed) on a fixed width
// so the bar layout stays stable
function ChipOrStackedTrigger({ label, variant, widthClass }: { label: string; variant: "chip" | "stacked"; widthClass?: string }) {
  if (variant === "chip") {
    return (
      <SelectTrigger size="sm" aria-label={label} className={cn(CHIP_TRIGGER_CLASS, widthClass, "justify-between")}>
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0 text-muted-foreground">{label}:</span>
          <span className="min-w-0 truncate">
            <SelectValue />
          </span>
        </span>
      </SelectTrigger>
    );
  }
  return (
    <SelectTrigger className="w-full">
      <SelectValue />
    </SelectTrigger>
  );
}

// Anchors the dropdown directly under the trigger, left-aligned, instead of
// the default item-aligned mode that overlays the trigger
// `min-w-0` overrides shadcn's default `min-w-36` floor so narrow chips (e.g.
// Group at w-32) get a dropdown that matches the trigger width instead of
// snapping out to 144px
function DropdownContent({ children }: { children: React.ReactNode }) {
  return (
    <SelectContent position="popper" side="bottom" align="start" sideOffset={4} className="min-w-0">
      {children}
    </SelectContent>
  );
}
