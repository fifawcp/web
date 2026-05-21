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
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              // Three-part active highlight: vertical accent bar on the left
              // edge, soft accent background, and strong accent text. The bar
              // is rendered via an absolutely-positioned pseudo span so the
              // soft background stays a clean rounded pill behind it.
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-page-accent-soft text-page-accent-strong" : "text-foreground hover:bg-muted"
              )}
            >
              <span
                aria-hidden
                className={cn("absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-page-accent transition-opacity", active ? "opacity-100" : "opacity-0")}
              />
              <Icon className={cn("size-4 shrink-0 transition-colors", active ? "text-page-accent" : "text-muted-foreground")} />
              <span>{t(item.key)}</span>
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
            {/* Underline uses `--page-accent` so it tints to match the route.
                Falls back to neutral (zinc-600/400) when no data-accent is set. */}
            <span className={cn("absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-page-accent transition-opacity", active ? "opacity-100" : "opacity-0")} />
          </Link>
        );
      })}
    </nav>
  );
}
