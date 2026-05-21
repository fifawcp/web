import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PlaceholderPage } from "@/shared/components/PlaceholderPage";

export const metadata: Metadata = { title: "Privacy policy | WCP" };

export default async function PrivacyPage() {
  const t = await getTranslations("pages");
  return <PlaceholderPage eyebrow={t("comingSoonBadge")} title={t("privacy.title")} body={t("privacy.body")} />;
}
