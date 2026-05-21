// Primary navigation items. `key` maps to the `nav` i18n namespace.
// Only routes that exist in the app today are listed here.
export const NAV_ITEMS = [
  { key: "dashboard", href: "/" },
  { key: "schedule", href: "/schedule" },
  { key: "pickems", href: "/pickems" },
  { key: "boards", href: "/boards" },
  { key: "standings", href: "/standings" },
  { key: "bracket", href: "/bracket" },
] as const;

// About routes — stub pages under src/app, keyed to the `pages` i18n namespace.
// /faq still exists as a page but is intentionally not linked here.
export const ABOUT_LINKS = [
  { key: "howItWorks", href: "/how-it-works" },
  { key: "rules", href: "/rules" },
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
] as const;

export const TBD_LINKS = [
  { key: "tbd", href: "/" },
  { key: "tbd2", href: "/" },
  { key: "tbd3", href: "/" },
  { key: "tbd4", href: "/" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

/** Whether `href` is the active route for the current `pathname`. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
