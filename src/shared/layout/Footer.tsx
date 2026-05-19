import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { GitHub } from "@/shared/icons/Github";
import { LinkedIn } from "@/shared/icons/LinkedIn";
import { ABOUT_LINKS, TBD_LINKS, NAV_ITEMS } from "@/shared/lib/nav-config";

import { Brand } from "./Brand";

const DEVELOPERS = [
  {
    name: "Julian Pereira",
    github: "https://github.com/Nzone56",
    linkedin: "https://www.linkedin.com/in/jpereirap",
  },
  {
    name: "Nicolas Conde",
    github: "https://github.com/ncondes",
    linkedin: "https://www.linkedin.com/in/ncondes",
  },
  {
    name: "Axel Gomez",
    github: "https://github.com/Axel072",
    linkedin: "https://www.linkedin.com/in/axgomezm/",
  },
] as const;

const sectionLabel = "text-2xs font-medium uppercase tracking-wider text-muted-foreground";
const navLink = "text-sm text-muted-foreground transition-colors hover:text-foreground";
const iconLink = "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tPages = await getTranslations("pages");
  const year = String(new Date().getFullYear());

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Brand + sitemap */}
        <div className="flex justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Brand />
            <p className="max-w-xs text-sm text-muted-foreground">{t("tagline")}</p>
          </div>

          {/* Play */}
          <div className="flex flex-1 justify-around px-8">
            <nav className="flex flex-col gap-3" aria-label={t("play")}>
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
            <nav className="flex flex-col gap-3" aria-label={t("about")}>
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
            <nav className="flex flex-col gap-3" aria-label={t("about")}>
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

          {/* Credits */}
          <div className="flex flex-col gap-3">
            <span className={sectionLabel}>{t("developedBy")}</span>
            <ul className="flex flex-col">
              {DEVELOPERS.map((dev) => (
                <li key={dev.name} className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground">{dev.name}</span>
                  <a href={dev.github} target="_blank" rel="noreferrer" aria-label={`${dev.name} on GitHub`} className={iconLink}>
                    <GitHub className="size-4" />
                  </a>
                  <a href={dev.linkedin} target="_blank" rel="noreferrer" aria-label={`${dev.name} on LinkedIn`} className={iconLink}>
                    <LinkedIn className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Legal fine print */}
        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6">
          <p className="max-w-4xl text-xs leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-2xs text-muted-foreground">{t("rights", { year })}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
