import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { GitHub } from "@/shared/icons/Github";
import { LinkedIn } from "@/shared/icons/LinkedIn";
import { ABOUT_LINKS, NAV_ITEMS, TBD_LINKS } from "@/shared/lib/nav-config";

import { Brand } from "./Brand";

const DEVELOPERS = [
  {
    name: "Nicolas Conde",
    github: "https://github.com/ncondes",
    linkedin: "https://www.linkedin.com/in/ncondes",
  },
  {
    name: "Julian Pereira",
    github: "https://github.com/Nzone56",
    linkedin: "https://www.linkedin.com/in/jpereirap",
  },
  {
    name: "Axel Gomez",
    github: "https://github.com/Axel072",
    linkedin: "https://www.linkedin.com/in/axgomezm/",
  },
] as const;

// Section labels stay quiet/uppercase (they're row headers). Nav links default
// to full foreground and dim on hover — inverts the usual muted→foreground
// convention so the destination feels primary and the column heading recedes.
const sectionLabel = "text-2xs font-medium uppercase tracking-wider text-muted-foreground/90";
const navLink = "text-sm text-foreground transition-colors hover:text-muted-foreground";
const iconLink = "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tPages = await getTranslations("pages");
  const year = String(new Date().getFullYear());

  // Single source of truth for the credit block — rendered under the brand on
  // lg+ and at the bottom of the nav region on mobile (after the About row).
  const contributors = (
    <div className="flex flex-col gap-4">
      <span className={sectionLabel}>{t("developedBy")}</span>
      <ul className="flex flex-row flex-wrap items-start gap-x-3 gap-y-4">
        {DEVELOPERS.flatMap((dev, idx) => {
          const card = (
            <li key={dev.name} className="flex flex-col items-center gap-1.5">
              <span className="text-sm font-medium text-foreground">{dev.name}</span>
              <span className="flex items-center gap-0.5">
                <a href={dev.github} target="_blank" rel="noreferrer" aria-label={t("social.github", { name: dev.name })} className={iconLink}>
                  <GitHub className="size-4" />
                </a>
                <a href={dev.linkedin} target="_blank" rel="noreferrer" aria-label={t("social.linkedin", { name: dev.name })} className={iconLink}>
                  <LinkedIn className="size-4" />
                </a>
              </span>
            </li>
          );
          if (idx === 0) return [card];
          // pt-1.5 sits the bullet on the name baseline so it separates the
          // names, not the icon rows below.
          return [
            <li key={`sep-${dev.name}`} aria-hidden className="self-start pt-1.5 text-muted-foreground/40">
              ·
            </li>,
            card,
          ];
        })}
      </ul>
    </div>
  );

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 lg:py-16">
        {/* Brand + sitemap. Mobile stacks the whole block; lg+ floats brand left. */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-24">
          {/* Brand + contributors. lg+ widens the column to fit the inline
              contributor row comfortably under the tagline. */}
          <div className="flex flex-col gap-3 lg:max-w-md lg:shrink-0">
            <Brand />
            <p className="text-sm text-muted-foreground">{t("tagline")}</p>

            {/* Contributors (desktop only). Mobile renders the same block at
                the bottom of the right region, after the About row. */}
            <div className="hidden pt-6 lg:block">{contributors}</div>
          </div>

          {/* Right region: nav grid, about row (mobile), contributors */}
          <div className="flex flex-col gap-10 lg:grow lg:gap-12">
            {/* Play + TBD columns. About joins them as a 3rd column on sm+; on
                mobile the About list moves below in a horizontal row. */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:gap-x-12">
              <nav className="flex min-w-0 flex-col gap-3" aria-label={t("platform")}>
                <span className={sectionLabel}>{t("platform")}</span>
                <ul className="flex flex-col gap-2.5">
                  {NAV_ITEMS.map((item) => (
                    <li key={item.key}>
                      <Link href={item.href} className={navLink}>
                        {tNav(item.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav className="flex min-w-0 flex-col gap-3" aria-label={TBD_LINKS[0].key}>
                <span className={sectionLabel}>{TBD_LINKS[0].key}</span>
                <ul className="flex flex-col gap-2.5">
                  {TBD_LINKS.map((link) => (
                    <li key={link.key}>
                      <Link href={link.href} className={navLink}>
                        TBD
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* About — vertical column on sm+ (where there's room). */}
              <nav className="hidden min-w-0 flex-col gap-3 sm:flex" aria-label={t("about")}>
                <span className={sectionLabel}>{t("about")}</span>
                <ul className="flex flex-col gap-2.5">
                  {ABOUT_LINKS.map((link) => (
                    <li key={link.key}>
                      <Link href={link.href} className={navLink}>
                        {tPages(`${link.key}.title`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* About — compact horizontal row on mobile only. Uses shortened
                labels so 5 items fit on one or two lines. */}
            <nav className="flex flex-col gap-3 sm:hidden" aria-label={t("about")}>
              <span className={sectionLabel}>{t("about")}</span>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {ABOUT_LINKS.map((link) => (
                  <li key={link.key}>
                    <Link href={link.href} className={navLink}>
                      {t(`aboutShort.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contributors (mobile/tablet only) — sits last in the nav stack,
                after the About row, fenced by a divider on top. The lg+
                rendering lives under the brand. */}
            <div className="border-t border-border pt-6 lg:hidden">{contributors}</div>
          </div>
        </div>

        {/* Legal fine print — centered on mobile, justified across on desktop. */}
        <div className="mt-6 flex flex-col items-center gap-4 border-t border-border pt-8 text-center text-muted-foreground/70 md:mt-12 md:flex-row md:items-start md:justify-between md:text-left">
          <p className="text-xs leading-relaxed md:max-w-2xl mb-4">{t("disclaimer")}</p>
          <p className="text-xs leading-relaxed font-semibold md:max-w-xs md:text-right">{t.rich("copyright", { year })}</p>
        </div>
      </div>
    </footer>
  );
}
