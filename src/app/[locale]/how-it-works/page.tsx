import { Award, BarChart3, Medal, Target, Trophy, UserPlus, Users, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Card } from "@/shared/components/ui/card";
import { buildPageMetadata } from "@/shared/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: "seo.howItWorks", path: "/how-it-works" });
}

const STEPS = [
  { key: "createAccount", icon: UserPlus },
  { key: "globalPredictions", icon: Trophy },
  { key: "matchScores", icon: Target },
  { key: "joinBoard", icon: Users },
  { key: "earnPoints", icon: Award },
] as const;

const PREDICTION_TYPES = [
  { key: "global", icon: Trophy },
  { key: "match", icon: Target },
  { key: "awards", icon: Medal },
] as const;

const BOARDS = [
  { key: "boards", icon: Users },
  { key: "competitions", icon: BarChart3 },
] as const;

const FACTS = ["teams", "matches", "countries", "venues"] as const;
const DATES = ["kickoff", "groupEnds", "knockoutsStart", "final"] as const;

const eyebrow = "text-2xs font-medium uppercase tracking-wider text-muted-foreground";

export default async function HowItWorksPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.howItWorks");

  return (
    <section className="container py-6 lg:py-8">
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start lg:gap-12 xl:gap-20">
        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:max-w-sm lg:self-start">
          <Hero eyebrow={t("eyebrow")} title={t("title")} intro={t("intro")} />
          <FactsCard />
          <TournamentDatesCard />
        </div>
        <div className="flex flex-col gap-10 lg:gap-12">
          <StepsCard />
          <SectionGroup heading={t("predictionTypes.heading")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {PREDICTION_TYPES.map(({ key, icon }) => (
                <SectionCard
                  key={key}
                  icon={icon}
                  eyebrow={t(`predictionTypes.${key}.eyebrow`)}
                  title={t(`predictionTypes.${key}.title`)}
                  body={t(`predictionTypes.${key}.body`)}
                />
              ))}
            </div>
          </SectionGroup>
          <SectionGroup heading={t("boards.heading")}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {BOARDS.map(({ key, icon }) => (
                <SectionCard key={key} icon={icon} eyebrow={t(`boards.${key}.eyebrow`)} title={t(`boards.${key}.title`)} body={t(`boards.${key}.body`)} />
              ))}
            </div>
          </SectionGroup>
          <SectionGroup heading={t("leaderboards.heading")}>
            <Card size="sm">
              <p className="px-5 text-sm leading-relaxed text-muted-foreground md:px-6">{t("leaderboards.body")}</p>
            </Card>
          </SectionGroup>
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

async function FactsCard() {
  const t = await getTranslations("pages.howItWorks.facts");
  return (
    <Card size="sm">
      <div className="flex flex-col gap-5 px-5 md:px-6">
        <span className={eyebrow}>{t("eyebrow")}</span>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
          {FACTS.map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <dd className="order-1 text-2xl font-bold leading-none tabular-nums text-foreground">{t(`${key}.value`)}</dd>
              <dt className="order-2 text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t(`${key}.label`)}</dt>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}

async function TournamentDatesCard() {
  const t = await getTranslations("pages.howItWorks.dates");
  return (
    <Card size="sm">
      <div className="flex flex-col gap-5 px-5 md:px-6">
        <span className={eyebrow}>{t("eyebrow")}</span>
        <ol className="relative flex flex-col gap-4">
          <span aria-hidden className="absolute left-1.5 top-3 bottom-3 w-px bg-border" />
          {DATES.map((key) => (
            <li key={key} className="relative flex items-baseline gap-3 pl-6">
              <span aria-hidden className="absolute left-0 top-1.5 size-3 rounded-full bg-page-accent-strong ring-4 ring-card" />
              <span className="text-sm text-muted-foreground">{t(`items.${key}.label`)}</span>
              <span className="ml-auto text-sm font-semibold tabular-nums text-foreground">{t(`items.${key}.date`)}</span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}

async function StepsCard() {
  const t = await getTranslations("pages.howItWorks.steps");
  return (
    <Card className="gap-0 py-0">
      <ol className="flex flex-col">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.key} className="flex items-start gap-4 border-b border-border px-5 py-5 last:border-b-0 md:px-6 md:py-6">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-page-accent-strong text-sm font-semibold text-page-accent-soft tabular-nums"
              >
                {index + 1}
              </span>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Icon aria-hidden className="size-4 shrink-0 text-page-accent" />
                  <h3 className="font-semibold text-foreground">{t(`${step.key}.title`)}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{t(`${step.key}.body`)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function SectionGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-xl font-bold tracking-tight md:text-2xl">{heading}</h2>
      {children}
    </section>
  );
}

type SectionCardProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
};

function SectionCard({ icon: Icon, eyebrow: eyebrowText, title, body }: SectionCardProps) {
  return (
    <Card size="sm" className="h-full">
      <div className="flex h-full flex-col gap-3 px-5 md:px-6">
        <div className="flex items-start justify-between gap-3">
          <span className={eyebrow}>{eyebrowText}</span>
          <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
            <Icon className="size-4" />
          </span>
        </div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </Card>
  );
}
