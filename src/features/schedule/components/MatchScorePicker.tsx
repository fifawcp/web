"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type { UserScorePick } from "../types/schedule.types";

const MIN_SCORE = 0;
const MAX_SCORE = 20;

type Props = {
  home: number;
  away: number;
  onChange: (pick: UserScorePick) => void;
  disabled?: boolean;
};

export function MatchScorePicker({ home, away, onChange, disabled }: Props) {
  const setHome = (v: number) => onChange({ home_score: v, away_score: away });
  const setAway = (v: number) => onChange({ home_score: home, away_score: v });

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      <ScoreStepper value={home} onChange={setHome} disabled={disabled} ariaLabel="home" />
      <span className="text-lg text-muted-foreground sm:text-xl">&minus;</span>
      <ScoreStepper value={away} onChange={setAway} disabled={disabled} ariaLabel="away" />
    </div>
  );
}

function ScoreStepper({ value, onChange, disabled, ariaLabel }: { value: number; onChange: (v: number) => void; disabled?: boolean; ariaLabel: string }) {
  return (
    <div className="relative flex h-20 w-10 items-center justify-center sm:w-12">
      <StepperButton
        className="absolute -top-0.5 sm:-top-2 left-1/2 -translate-x-1/2"
        onClick={() => onChange(Math.min(MAX_SCORE, value + 1))}
        disabled={disabled || value >= MAX_SCORE}
        aria-label={`Increase ${ariaLabel} score`}
      >
        <Plus />
      </StepperButton>
      <span className="text-center text-xl font-semibold tabular-nums leading-none text-foreground sm:text-2xl">{value}</span>
      <StepperButton
        className="absolute -bottom-0.5 sm:-bottom-2 left-1/2 -translate-x-1/2"
        onClick={() => onChange(Math.max(MIN_SCORE, value - 1))}
        disabled={disabled || value <= MIN_SCORE}
        aria-label={`Decrease ${ariaLabel} score`}
      >
        <Minus />
      </StepperButton>
    </div>
  );
}

function StepperButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <Button
      type="button"
      size="icon-xs"
      className={cn(
        "cursor-pointer border-border bg-card dark:bg-card text-foreground shadow-xs hover:bg-muted dark:hover:bg-muted disabled:opacity-40 sm:size-8 sm:[&_svg]:size-3.5",
        className
      )}
      {...props}
    />
  );
}
