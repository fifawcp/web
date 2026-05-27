import { BarChart3, Calendar, GitBranch, LayoutDashboard, ListChecks, Users, type LucideIcon } from "lucide-react";

// Primary navigation items. `key` maps to the `nav` i18n namespace; `icon`
// is rendered in the mobile drawer (desktop bar stays text-only).
// Only routes that exist in the app today are listed here.
export const NAV_ITEMS: ReadonlyArray<{ key: string; href: string; icon: LucideIcon }> = [
  { key: "dashboard", href: "/", icon: LayoutDashboard },
  { key: "schedule", href: "/schedule", icon: Calendar },
  { key: "pickems", href: "/pickems", icon: ListChecks },
  { key: "boards", href: "/boards", icon: Users },
  { key: "standings", href: "/standings", icon: BarChart3 },
  { key: "bracket", href: "/bracket", icon: GitBranch },
];

// About routes — stub pages under src/app, keyed to the `pages` i18n namespace.
export const ABOUT_LINKS = [
  { key: "howItWorks", href: "/how-it-works" },
  { key: "rules", href: "/rules" },
  { key: "faq", href: "/faq" },
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
] as const;

// Community routes. All land on /boards: the global board, or the index with a
// query param that auto-opens the create / join dialog (see useBoardDialogParam).
export const COMMUNITY_LINKS = [
  { key: "globalBoard", href: "/boards?board=global" },
  { key: "createBoard", href: "/boards?dialog=create" },
  { key: "joinBoard", href: "/boards?dialog=join" },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];

export { type LucideIcon } from "lucide-react";

/** Whether `href` is the active route for the current `pathname`. */
export function isNavItemActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
