import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PlaceholderPage } from "@/shared/components/PlaceholderPage";

export const metadata: Metadata = { title: "How it works | WCP" };

export default async function HowItWorksPage() {
  const t = await getTranslations("pages");
  return <PlaceholderPage eyebrow={t("comingSoonBadge")} title={t("howItWorks.title")} body={t("howItWorks.body")} />;
}
