import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { AWARDS_CACHE_TAG } from "@/features/awards/api/awards";
import { AwardsView } from "@/features/awards/components/AwardsView";
import type { UserAwards } from "@/features/awards/types/awards.types";
import { serverApi } from "@/shared/lib/api/server";

export async function generateMetadata() {
  const t = await getTranslations("awards");
  return { title: `${t("title")} | WCP` };
}

export default async function AwardsPage() {
  const t = await getTranslations("awards");

  const res = await serverApi.get<UserAwards>("/api/awards", {
    authenticated: true,
    next: { revalidate: 60, tags: [AWARDS_CACHE_TAG] },
  });

  if (!res.success || !res.data) {
    throw new Error(res.error?.message ?? "Failed to load awards");
  }

  return (
    <>
      <h1 className="sr-only">{t("title")}</h1>
      <Suspense>
        <AwardsView initialData={res.data} />
      </Suspense>
    </>
  );
}
