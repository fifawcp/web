import { Link } from "@/i18n/navigation";
import { BallTarget } from "@/shared/icons/BallTarget";
import { cn } from "@/shared/lib/utils";

type BrandProps = {
  href?: string;
  onClick?: () => void;
  className?: string;
};

/** Logo lockup: ball-target icon + two-line wordmark. Shared by header, drawer and footer. */
export function Brand({ href = "/", onClick, className }: BrandProps) {
  return (
    <Link href={href} onClick={onClick} className={cn("flex items-center gap-3", className)}>
      {/* Brand mark stays black-on-light in both themes. Light mode picks up
          a neutral muted tint so the chip carries weight against the lighter
          drawer surface; dark mode keeps the pure white chip so the mark
          beacons against the dark drawer. */}
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-black dark:bg-white">
        <BallTarget size={26} />
      </div>
      <span className="flex flex-col leading-none">
        <span className="text-2xs font-medium uppercase tracking-[0.18em] text-muted-foreground">2026</span>
        <span className="text-sm font-bold tracking-tight">Pick&apos;ems</span>
      </span>
    </Link>
  );
}
