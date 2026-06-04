import type { BoardMemberPreview } from "@/features/boards/types/boards.types";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { avatarTone, getInitials } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

type Size = "sm" | "md";
type Tone = "tinted" | "neutral" | "surface";

const SIZE_CLASS: Record<Size, string> = {
  sm: "size-7 text-2xs",
  md: "size-9 text-xs",
};

type Props = {
  members: BoardMemberPreview[];
  total: number;
  max?: number;
  size?: Size;
  tone?: Tone;
  overlap?: boolean;
  className?: string;
};

export function AvatarStack({ members, total, max = 5, size = "md", tone = "tinted", overlap = true, className }: Props) {
  const shown = members.slice(0, max);
  const overflow = total - shown.length;
  const sizeClass = SIZE_CLASS[size];
  const fallbackTone = (seed: string) => {
    if (tone === "neutral") return "bg-foreground/90 text-background";
    if (tone === "surface") return "bg-card text-foreground";
    return avatarTone(seed);
  };
  const ring = overlap ? "ring-2 ring-background" : "";
  const surfaceBorder = tone === "surface" ? "border border-border" : "";

  return (
    <div className={cn("flex items-center", !overlap && "gap-1.5", className)}>
      {shown.map((m) => (
        <Avatar key={m.user_id} className={cn(sizeClass, ring, surfaceBorder, overlap && "-ml-1.5 first:ml-0")}>
          <AvatarFallback className={cn("font-semibold", fallbackTone(m.user_id))}>
            {getInitials(m.username, m.first_name ?? undefined, m.last_name ?? undefined)}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 ? (
        <span className={cn(sizeClass, ring, overlap && "-ml-1.5", "grid place-items-center rounded-full bg-muted font-semibold text-muted-foreground")}>
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
