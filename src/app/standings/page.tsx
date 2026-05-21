import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PlaceholderPage } from "@/shared/components/PlaceholderPage";

export const metadata: Metadata = { title: "Standings | WCP" };

export default async function StandingsPage() {
  const t = await getTranslations("pages");
  return <PlaceholderPage eyebrow={t("comingSoonBadge")} title={t("standings.title")} body={t("standings.body")} />;
}
