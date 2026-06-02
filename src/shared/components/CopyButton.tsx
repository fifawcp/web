"use client";

import type { ComponentProps } from "react";
import { Check, Copy } from "lucide-react";

import { useClipboard } from "@/shared/hooks/useClipboard";
import { cn } from "@/shared/lib/utils";

import { Button } from "./ui/button";

type Props = {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  size?: "sm" | "default";
  variant?: ComponentProps<typeof Button>["variant"];
  // Render just the clipboard icon (no text). The label still drives the accessible name.
  iconOnly?: boolean;
  onCopied?: () => void;
};

export function CopyButton({ value, label, copiedLabel, className, size = "sm", variant = "outline", iconOnly = false, onCopied }: Props) {
  const { copied, copy } = useClipboard();
  const text = copied ? (copiedLabel ?? "Copied") : (label ?? "Copy");
  const Icon = copied ? Check : Copy;

  return (
    <Button
      type="button"
      variant={variant}
      size={iconOnly ? "icon-sm" : size}
      className={cn(!iconOnly && "gap-1.5", className)}
      onClick={async () => {
        const ok = await copy(value);
        if (ok && onCopied) onCopied();
      }}
      aria-live="polite"
      aria-label={iconOnly ? text : undefined}
    >
      <Icon className="size-3.5" aria-hidden />
      {iconOnly ? null : <span>{text}</span>}
    </Button>
  );
}
