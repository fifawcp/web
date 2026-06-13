import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { avatarTone, getInitials } from "@/shared/lib/ui";
import { cn } from "@/shared/lib/utils";

type Props = {
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  // Drops the hash-derived colour for a neutral muted fill.
  neutral?: boolean;
  className?: string;
  fallbackClassName?: string;
};

// Identity avatar — hash-derived tone + initials. Shared across the reveal surfaces.
export function MemberAvatar({ username, firstName, lastName, neutral = false, className, fallbackClassName }: Props) {
  return (
    <Avatar className={cn("size-9", className)}>
      <AvatarFallback className={cn("text-xs font-semibold", neutral ? "bg-muted text-muted-foreground" : avatarTone(username), fallbackClassName)}>
        {getInitials(username, firstName ?? undefined, lastName ?? undefined)}
      </AvatarFallback>
    </Avatar>
  );
}
