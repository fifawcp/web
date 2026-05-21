import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Terms of service | WCP" };

const eyebrow = "text-2xs font-medium uppercase tracking-wider text-muted-foreground";

export default async function TermsPage() {
  const t = await getTranslations("pages.terms");

  return (
    <section className="container py-6 lg:py-8">
      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-4 border-b border-border pb-10">
          <span className={eyebrow}>{t("eyebrow")}</span>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {t("effective")} · {t("updated")}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{t("intro")}</p>
        </header>

        <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:gap-x-16">
          <LegalSection number={1} title={t("sections.about.title")}>
            <p>{t("sections.about.body")}</p>
          </LegalSection>

          <LegalSection number={2} title={t("sections.usage.title")}>
            <p>{t("sections.usage.body")}</p>
          </LegalSection>

          <LegalSection number={3} title={t("sections.accounts.title")}>
            <BulletList items={["credentials", "noMultiple", "accurate", "suspend"].map((key) => t(`sections.accounts.items.${key}`))} />
          </LegalSection>

          <LegalSection number={4} title={t("sections.predictions.title")}>
            <p>{t("sections.predictions.body")}</p>
          </LegalSection>

          <LegalSection number={5} title={t("sections.conduct.title")}>
            <p>{t("sections.conduct.body")}</p>
          </LegalSection>

          <LegalSection number={6} title={t("sections.ip.title")}>
            <p>{t("sections.ip.body")}</p>
          </LegalSection>

          <LegalSection number={7} title={t("sections.disclaimers.title")}>
            <p>{t("sections.disclaimers.body")}</p>
          </LegalSection>

          <LegalSection number={8} title={t("sections.changes.title")}>
            <p>{t("sections.changes.body")}</p>
          </LegalSection>
        </div>
      </div>
    </section>
  );
}

function LegalSection({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
        {number}. {title}
      </h2>
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground md:text-base">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 flex list-outside list-disc flex-col gap-2 marker:text-muted-foreground/60">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
