import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import { PICKEMS_CACHE_TAG } from "@/features/pickems/api/pickems";
import { PickemsView } from "@/features/pickems/components/PickemsView";
import type { UserPickem } from "@/features/pickems/types/pickems.types";
import { getCurrentUser } from "@/lib/auth";
import { serverApi } from "@/shared/lib/api/server";

export default async function PickemsPage() {
  const t = await getTranslations("pickems");
  const user = await getCurrentUser();

  const res = await serverApi.get<UserPickem>("/api/pickems", {
    authenticated: true,
    next: {
      revalidate: 60,
      tags: [PICKEMS_CACHE_TAG],
    },
  });

  if (!res.success || !res.data) {
    throw new Error(res.error?.message ?? "Failed to load pickems");
  }

  return (
    <>
      <h1 className="sr-only">{t("title")}</h1>
      <Suspense>
        <PickemsView initialData={res.data} userId={user?.id} />
      </Suspense>
    </>
  );
}
