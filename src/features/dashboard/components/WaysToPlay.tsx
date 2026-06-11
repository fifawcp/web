import { ArrowRight, Award, Goal, GitBranch, Hand, Star, Target, Trophy, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Reveal } from "@/shared/components/Reveal";
import { cn } from "@/shared/lib/utils";

// Three ways to score. Match Picks is live (the interactive demo sits above);
// bracket + awards are set before kickoff, so they're shown as illustrative cards.
export async function WaysToPlay() {
  const t = await getTranslations("dashboard.landing.waysToPlay");

  return (
    <section className="flex flex-col gap-6">
      <Reveal from="up" className="flex max-w-2xl flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h2>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </Reveal>

      <Reveal stagger={0.1} className="grid gap-4 sm:grid-cols-3">
        <PlayCard icon={Target} live title={t("match.title")} desc={t("match.desc")} scoring={t("match.scoring")} note={t("match.note")}>
          <div className="flex items-center gap-2">
            <Chip>2&ndash;1</Chip>
            <span className="text-xs text-muted-foreground">{t("match.visual")}</span>
          </div>
        </PlayCard>

        <PlayCard icon={GitBranch} title={t("bracket.title")} desc={t("bracket.desc")} scoring={t("bracket.scoring")} note={t("bracket.note")}>
          <div className="flex items-center gap-1.5 text-xs">
            <Chip>1st</Chip>
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <Chip>QF</Chip>
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <Chip accent>
              <Trophy className="size-3" aria-hidden />
            </Chip>
          </div>
        </PlayCard>

        <PlayCard icon={Award} title={t("awards.title")} desc={t("awards.desc")} scoring={t("awards.scoring")} note={t("awards.note")}>
          <div className="flex items-center gap-1.5">
            {[Goal, Trophy, Hand, Star].map((Honor, i) => (
              <span key={i} className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Honor className="size-3.5" aria-hidden />
              </span>
            ))}
          </div>
        </PlayCard>
      </Reveal>
    </section>
  );
}

type PlayCardProps = {
  icon: LucideIcon;
  title: string;
  desc: string;
  scoring: string;
  note: string;
  live?: boolean;
  children: React.ReactNode;
};

function PlayCard({ icon: Icon, title, desc, scoring, note, live, children }: PlayCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-page-accent-soft text-page-accent-strong">
          <Icon className="size-4.5" aria-hidden />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-medium",
            live ? "bg-lime-500/15 text-lime-700 dark:text-lime-400" : "bg-muted text-muted-foreground"
          )}
        >
          {live && <span className="size-1.5 rounded-full bg-lime-500" />}
          {note}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="font-semibold leading-tight">{title}</h3>
        <p className="text-xs leading-snug text-muted-foreground">{desc}</p>
      </div>

      <div className="min-h-7">{children}</div>

      <div className="border-t border-border pt-3 text-xs font-medium text-page-accent-strong">{scoring}</div>
    </div>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-7 items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums",
        accent ? "bg-page-accent text-white" : "bg-muted text-foreground"
      )}
    >
      {children}
    </span>
  );
}
