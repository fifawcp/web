import Link from "next/link";

import { WCP } from "@/shared/icons/WCP";
import { cn } from "@/shared/lib/utils";

type BrandProps = {
  href?: string;
  onClick?: () => void;
  className?: string;
};

/** Logo lockup: WCP icon mark + two-line wordmark. Shared by header, drawer and footer. */
export function Brand({ href = "/", onClick, className }: BrandProps) {
  return (
    <Link href={href} onClick={onClick} className={cn("flex items-center gap-3", className)}>
      <div className="flex p-0.5 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <WCP width={32} height={32} fill="currentColor" />
      </div>
      <span className="flex flex-col leading-none">
        <span className="text-2xs font-medium uppercase tracking-[0.18em] text-muted-foreground">2026</span>
        <span className="text-sm font-bold tracking-tight">Pick&apos;ems</span>
      </span>
    </Link>
  );
}
