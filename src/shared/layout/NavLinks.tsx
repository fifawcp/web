"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { isNavItemActive, NAV_ITEMS } from "@/shared/lib/nav-config";
import { cn } from "@/shared/lib/utils";

type NavLinksProps = {
  /** `bar` = horizontal desktop header, `drawer` = stacked mobile menu. */
  variant: "bar" | "drawer";
  onNavigate?: () => void;
};

export function NavLinks({ variant, onNavigate }: NavLinksProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  if (variant === "drawer") {
    return (
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn("rounded-md px-3 py-2.5 text-sm font-medium transition-colors text-foreground", active ? "bg-muted font-bold" : "")}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(pathname, item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(item.key)}
            <span className={cn("absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-foreground transition-opacity", active ? "opacity-100" : "opacity-0")} />
          </Link>
        );
      })}
    </nav>
  );
}
