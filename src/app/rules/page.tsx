import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PlaceholderPage } from "@/shared/components/PlaceholderPage";

export const metadata: Metadata = { title: "Rules & scoring | WCP" };

export default async function RulesPage() {
  const t = await getTranslations("pages");
  return <PlaceholderPage eyebrow={t("comingSoonBadge")} title={t("rules.title")} body={t("rules.body")} />;
}
