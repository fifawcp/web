"use client";

import { TriangleAlert } from "lucide-react";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

type Props = {
  warning: React.ReactNode;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  inputId: string;
};

// Warning callout + "type the name to confirm" field; the caller owns the match check.
export function ConfirmByTyping({ warning, label, value, onChange, placeholder, autoFocus, inputId }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
        <p className="leading-snug text-foreground">{warning}</p>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={inputId} className="text-muted-foreground">
          {label}
        </Label>
        <Input id={inputId} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoFocus={autoFocus} autoComplete="off" />
      </div>
    </div>
  );
}
