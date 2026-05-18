import { getTranslations } from "next-intl/server";

import { GitHub } from "../icons/Github";
import { LinkedIn } from "../icons/LinkedIn";

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
] as const;

export async function Footer() {
  const t = await getTranslations("footer");
  const year = String(new Date().getFullYear());

  return (
    <footer className="border-t border-border bg-card">
      <div className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row items-center sm:justify-between">
          <div className="flex flex-col gap-2 items-center sm:items-start">
            <Brand />
            <p className="text-xs text-muted-foreground">{t("tagline")}</p>
          </div>

          <div className="flex flex-col gap-2 items-center sm:items-start">
            <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("developedBy")}</span>
            {DEVELOPERS.map((dev) => (
              <div key={dev.name} className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">{dev.name}</span>
                <a
                  href={dev.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${dev.name} on GitHub`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <GitHub className="size-4" />
                </a>
                <a
                  href={dev.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${dev.name} on LinkedIn`}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <LinkedIn className="size-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-border pt-4 ">
          <p className="text-xs leading-relaxed text-muted-foreground text-center">{t("disclaimer")}</p>
          <p className="text-xs text-muted-foreground text-center">{t("rights", { year })}</p>
        </div>
      </div>
    </footer>
  );
}
