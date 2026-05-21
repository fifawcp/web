import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = { title: "Privacy policy | WCP" };

const eyebrow = "text-2xs font-medium uppercase tracking-wider text-muted-foreground";

export default async function PrivacyPage() {
  const t = await getTranslations("pages.privacy");

  return (
    <section className="container py-6 lg:py-8">
      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-4 border-b border-border pb-10">
          <span className={eyebrow}>{t("eyebrow")}</span>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{t("intro")}</p>
        </header>

        <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:gap-x-16">
          <LegalSection number={1} title={t("sections.infoCollected.title")}>
            <LabeledParagraph label={t("sections.infoCollected.items.account.label")} body={t("sections.infoCollected.items.account.body")} />
            <LabeledParagraph label={t("sections.infoCollected.items.usage.label")} body={t("sections.infoCollected.items.usage.body")} />
            <LabeledParagraph label={t("sections.infoCollected.items.device.label")} body={t("sections.infoCollected.items.device.body")} />
          </LegalSection>

          <LegalSection number={2} title={t("sections.howWeUse.title")}>
            <BulletList items={["operate", "calculate", "display", "send"].map((key) => t(`sections.howWeUse.items.${key}`))} />
          </LegalSection>

          <LegalSection number={3} title={t("sections.sharing.title")}>
            <p>{t("sections.sharing.body")}</p>
          </LegalSection>

          <LegalSection number={4} title={t("sections.storage.title")}>
            <p>{t("sections.storage.body")}</p>
          </LegalSection>

          <LegalSection number={5} title={t("sections.yourRights.title")}>
            <p>{t("sections.yourRights.body")}</p>
          </LegalSection>

          <LegalSection number={6} title={t("sections.cookies.title")}>
            <p>{t("sections.cookies.body")}</p>
          </LegalSection>

          <LegalSection number={7} title={t("sections.contact.title")}>
            <p>{t("sections.contact.body")}</p>
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

function LabeledParagraph({ label, body }: { label: string; body: string }) {
  return (
    <p>
      <strong className="font-semibold text-foreground">{label}:</strong> {body}
    </p>
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
