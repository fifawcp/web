// Primary navigation items. `key` maps to the `nav` i18n namespace.
// Only routes that exist in the app today are listed here.
export const NAV_ITEMS = [
  { key: "dashboard", href: "/" },
  { key: "schedule", href: "/schedule" },
  { key: "boards", href: "/boards" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

/** Whether `href` is the active route for the current `pathname`. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
