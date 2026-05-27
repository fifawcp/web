import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Card } from "@/shared/components/ui/card";
import { buildPageMetadata } from "@/shared/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: "seo.rules", path: "/rules" });
}

const MATCH_SCORE_ITEMS = [
  { key: "exact", points: 5 },
  { key: "outcome", points: 2 },
  { key: "incorrect", points: 0 },
] as const;

const GROUP_ITEMS = [
  { key: "exactPosition", points: 3 },
  { key: "qualifies", points: 1 },
  { key: "incorrect", points: 0 },
] as const;

const KNOCKOUT_ITEMS = [
  { key: "bestThird", points: 2 },
  { key: "r32", points: 4 },
  { key: "r16", points: 6 },
  { key: "quarterfinals", points: 8 },
  { key: "semifinals", points: 12 },
  { key: "thirdPlace", points: 16 },
  { key: "final", points: 20 },
] as const;

const GENERAL_RULES = ["picksLock", "keepEditing", "fullTime", "tiebreakers"] as const;

const eyebrow = "text-2xs font-medium uppercase tracking-wider text-muted-foreground";

function formatPoints(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

export default async function RulesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.rules");

  return (
    <section className="container py-6 lg:py-8">
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start lg:gap-12 xl:gap-20">
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:max-w-sm lg:self-start">
          <Hero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
          <GeneralRulesCard />
        </div>
        <div className="flex flex-col gap-10 lg:gap-12">
          <ScoringSection
            heading={t("matchScore.heading")}
            items={MATCH_SCORE_ITEMS.map(({ key, points }) => ({
              label: t(`matchScore.items.${key}.label`),
              description: t(`matchScore.items.${key}.description`),
              points,
            }))}
          />
          <ScoringSection
            heading={t("group.heading")}
            items={GROUP_ITEMS.map(({ key, points }) => ({
              label: t(`group.items.${key}.label`),
              description: t(`group.items.${key}.description`),
              points,
            }))}
          />
          <ScoringSection
            heading={t("knockouts.heading")}
            items={KNOCKOUT_ITEMS.map(({ key, points }) => ({
              label: t(`knockouts.items.${key}.label`),
              description: t(`knockouts.items.${key}.description`),
              points,
            }))}
          />
        </div>
      </div>
    </section>
  );
}

function Hero({ eyebrow: eyebrowText, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <header className="flex flex-col gap-4">
      <span className={eyebrow}>{eyebrowText}</span>
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{intro}</p>
    </header>
  );
}

async function GeneralRulesCard() {
  const t = await getTranslations("pages.rules.general");
  return (
    <Card size="sm">
      <div className="flex flex-col gap-5 px-5 md:px-6">
        <span className={eyebrow}>{t("heading")}</span>
        <dl className="flex flex-col gap-5">
          {GENERAL_RULES.map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <dt className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-page-accent" />
                {t(`items.${key}.title`)}
              </dt>
              <dd className="pl-3.5 text-sm leading-relaxed text-muted-foreground">{t(`items.${key}.body`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}

type ScoringItem = {
  label: string;
  description: string;
  points: number;
};

function ScoringSection({ heading, items }: { heading: string; items: ScoringItem[] }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-xl font-bold tracking-tight md:text-2xl">{heading}</h2>
      <Card className="gap-0 py-0">
        <ol className="flex flex-col">
          {items.map((item) => (
            <li key={item.label} className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0 md:px-6 md:py-5">
              <div className="flex min-w-0 flex-col gap-0.5">
                <h3 className="font-semibold text-foreground">{item.label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
              <span className={`shrink-0 text-lg font-bold tabular-nums ${item.points > 0 ? "text-page-accent-strong" : "text-muted-foreground"}`}>
                {formatPoints(item.points)}
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </section>
  );
}
