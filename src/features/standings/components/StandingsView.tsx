import { getTranslations } from "next-intl/server";

import type { GroupStandings, PickIndex } from "../types/standings.types";

import { GroupCard } from "./GroupCard";

type Props = {
  groups: GroupStandings[];
  pickIndex: PickIndex | null;
};

export async function StandingsView({ groups, pickIndex }: Props) {
  const t = await getTranslations("standings");
  const isComparing = pickIndex !== null && pickIndex.size > 0;

  return (
    <div className="container mx-auto flex w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">{t("stageHeading")}</span>
          {isComparing && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-500/30 bg-lime-500/15 px-2.5 py-1 text-2xs font-medium text-lime-700 dark:text-lime-400">
              <span aria-hidden className="size-1.5 rounded-full bg-lime-500" />
              {t("comparingWithMyPicks")}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{t("description")}</p>
      </header>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <GroupCard key={g.group_code} group={g} pickIndex={pickIndex} />
        ))}
      </div>
    </div>
  );
}
