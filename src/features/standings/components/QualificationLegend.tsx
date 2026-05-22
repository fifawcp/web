import { getTranslations } from "next-intl/server";

/** Two-dot legend explaining the left-edge color indicators on each row. */
export async function QualificationLegend() {
  const t = await getTranslations("standings.legend");
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-4 py-3 text-2xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="size-2 rounded-full bg-foreground" />
        {t("advancesToR32")}
      </span>
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="size-2 rounded-full bg-muted-foreground/40" />
        {t("bestThirdPlayoff")}
      </span>
    </div>
  );
}
