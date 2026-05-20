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

// Hierarchy: section titles stay dim/uppercase (labels), links default to full
// foreground (actionable, matches the "DESIGNED & DEVELOPED BY → dev name" pattern),
// and dim on hover. Inverts the usual muted→foreground hover convention.
const sectionLabel = "text-2xs font-medium uppercase tracking-wider text-muted-foreground/90";
const navLink = "text-xs md:text-sm text-foreground transition-colors hover:text-muted-foreground";
const iconLink = "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";
// grow + basis lets columns wrap and fill the row at every width; min-w-0 prevents x-overflow.
const column = "flex min-w-0 grow basis-32 flex-col gap-3";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tPages = await getTranslations("pages");
  const year = String(new Date().getFullYear());

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Brand + sitemap */}
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
          {/* Brand */}
          <div className="flex flex-col gap-3 lg:max-w-50 lg:shrink-0">
            <Brand />
            <p className="text-xs md:text-sm text-muted-foreground">{t("tagline")}</p>
          </div>

          {/* Sitemap — wrapping flex columns */}
          <div className="flex grow flex-wrap gap-x-4 gap-y-8">
            {/* Play */}
            <nav className={column} aria-label={t("play")}>
              <span className={sectionLabel}>{t("play")}</span>
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

            {/* TBD */}
            <nav className={column} aria-label={TBD_LINKS[0].key}>
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

            {/* About */}
            <nav className={column} aria-label={t("about")}>
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

            {/* Pickems brand + credits — right-side block, Claude-style */}
            <div className={column}>
              <div className="flex flex-col gap-2">
                <span className={sectionLabel}>{t("developedBy")}</span>
                <ul className="flex flex-col gap-1.5">
                  {DEVELOPERS.map((dev) => (
                    <li key={dev.name} className="flex items-center gap-2">
                      <span className="w-26 shrink-0 truncate text-sm font-medium text-foreground">{dev.name}</span>
                      <span className="flex items-center">
                        <a href={dev.github} target="_blank" rel="noreferrer" aria-label={`${dev.name} on GitHub`} className={iconLink}>
                          <GitHub className="size-4" />
                        </a>
                        <a href={dev.linkedin} target="_blank" rel="noreferrer" aria-label={`${dev.name} on LinkedIn`} className={iconLink}>
                          <LinkedIn className="size-4" />
                        </a>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Legal fine print — rich-text emphasises the brand on both desktop and mobile */}
        <div className="mt-10 flex flex-col items-center md:flex-row gap-4 border-t border-border pt-6 justify-between text-muted-foreground/70">
          <p className="md:max-w-1/2 text-xs leading-relaxed ">{t("disclaimer")}</p>
          <div className="flex flex-col items-center md:items-end md:max-w-58 font-semibold">
            <p className="text-xs leading-relaxed ">
              {t.rich("copyright", {
                year,
              })}
            </p>
            <p className="text-xs leading-relaxed text-center md:text-right">{t("rights")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
