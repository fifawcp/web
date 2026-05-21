import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PlaceholderPage } from "@/shared/components/PlaceholderPage";

export const metadata: Metadata = { title: "Terms of service | WCP" };

export default async function TermsPage() {
  const t = await getTranslations("pages");
  return <PlaceholderPage eyebrow={t("comingSoonBadge")} title={t("terms.title")} body={t("terms.body")} />;
}
