import * as React from "react";
import { cn } from "@/shared/lib/utils";

function hasRenderableMessage(node: React.ReactNode): boolean {
  if (node == null || node === false || node === true) return false;
  if (typeof node === "string") return node.trim().length > 0;
  if (typeof node === "number") return true;
  if (Array.isArray(node)) return node.some(hasRenderableMessage);
  return true;
}

export type FieldMessageSlotProps = React.ComponentProps<"div"> & {
  label?: React.ReactNode;
  labelClassName?: string;
  minHeightClass?: string;
  scrollClass?: string;
  contentClassName?: string;
};

export function FieldMessageSlot({
  label,
  labelClassName = "text-muted-foreground",
  children,
  className,
  minHeightClass = "min-h-5",
  scrollClass,
  contentClassName,
  ...rest
}: FieldMessageSlotProps) {
  const showMessage = hasRenderableMessage(children);

  return (
    <div className={cn(minHeightClass, className)} {...rest}>
      <div
        className={cn("text-sm", scrollClass, contentClassName)}
        aria-live="polite"
      >
        {showMessage ? (
          children
        ) : label != null && label !== false ? (
          <span className={cn("block", labelClassName)}>{label}</span>
        ) : null}
      </div>
    </div>
  );
}