import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/components/ui/accordion";
import { buildPageMetadata } from "@/shared/seo/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildPageMetadata({ locale, namespace: "seo.faq", path: "/faq" });
}

const FAQ_KEYS = ["whatIs", "howToPlay", "whenLock", "editPicks", "scoring", "boards", "joinMultiple", "createBoard", "free", "prizes"] as const;

const eyebrow = "text-2xs font-medium uppercase tracking-wider text-muted-foreground";
const linkClass = "font-medium text-page-accent-strong underline underline-offset-2 hover:text-page-accent";

export default async function FaqPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.faq");

  return (
    <section className="container py-6 lg:py-8">
      <div className="flex flex-col gap-10">
        <header className="flex flex-col gap-4 border-b border-border pb-10">
          <span className={eyebrow}>{t("eyebrow")}</span>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{t("title")}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{t("intro")}</p>
        </header>

        <Accordion type="single" collapsible className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-start">
          {FAQ_KEYS.map((key) => (
            <AccordionItem key={key} value={key} className="rounded-xl border border-border bg-card px-5 data-[state=open]:bg-muted/30">
              <AccordionTrigger className="py-4 text-left text-base font-semibold hover:no-underline md:text-lg">{t(`items.${key}.question`)}</AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                {t.rich(`items.${key}.answer`, {
                  rulesLink: (chunks) => (
                    <Link href="/rules" className={linkClass}>
                      {chunks}
                    </Link>
                  ),
                  boardsLink: (chunks) => (
                    <Link href="/boards" className={linkClass}>
                      {chunks}
                    </Link>
                  ),
                  howItWorksLink: (chunks) => (
                    <Link href="/how-it-works" className={linkClass}>
                      {chunks}
                    </Link>
                  ),
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
