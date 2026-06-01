import { Check } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center w-full mb-6">
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isMuted = !isCompleted && !isActive;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all",
                  isCompleted && "bg-foreground border-2 border-foreground text-background",
                  isActive && "border-[1.5px] border-foreground text-foreground",
                  isMuted && "border border-muted-foreground/40 text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" aria-label="completed" /> : <span className="text-base font-medium">{index + 1}</span>}
              </div>
              <span className={cn("text-sm whitespace-nowrap transition-all", isActive && "font-bold text-foreground", isMuted && "text-muted-foreground opacity-60")}>
                {label}
              </span>
            </div>

            {index < steps.length - 1 && <div className={cn("flex-1 h-px mx-3 transition-all", isCompleted ? "bg-foreground" : "bg-border")} />}
          </div>
        );
      })}
    </div>
  );
}
