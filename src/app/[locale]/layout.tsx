import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { Providers } from "@/providers/layout-provider";
import { AuthRouteGate } from "@/shared/layout/AuthRouteGate";
import { Footer } from "@/shared/layout/Footer";
import { Header } from "@/shared/layout/Header";
import { ScrollToTop } from "@/shared/layout/ScrollToTop";
import { cn } from "@/shared/lib/utils";

import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export { generateMetadata } from "@/shared/seo/metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enable static rendering for nested pages; must run before any next-intl API.
  setRequestLocale(locale);

  const messages = await getMessages();
  return (
    <html lang={locale} className={cn("h-full antialiased", "font-sans", inter.variable)} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers messages={messages} locale={locale}>
          <ScrollToTop />
          <AuthRouteGate>
            <Header />
          </AuthRouteGate>
          <main className="flex-1 overflow-x-clip min-h-[calc(100dvh-var(--header-height))]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
