// Shared classes for the chip-style filter triggers (Select trigger + the
// team Combobox button) so they read as a single visual family
export const CHIP_TRIGGER_CLASS =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-normal text-foreground shadow-none transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 hover:bg-muted/60 data-[state=open]:bg-muted";

// Stacked variant trigger: matches the shadcn SelectTrigger so the team
// Combobox sits flush alongside the other Select-based filters in the drawer
export const STACKED_TRIGGER_CLASS =
  "flex h-9 w-full cursor-pointer items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:bg-input/30";
