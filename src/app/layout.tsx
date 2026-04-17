import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { Header } from "@/shared/layout/header";
import "./globals.css";
import { Providers } from "@/shared/providers/layout-provider";

export const metadata: Metadata = {
  title: "WCP",
  description: "Predict match scores and compete with friends in the 2026 World Cup pick'em game",
  icons: {
    icon: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();
  const locale = await getLocale();
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers messages={messages} locale={locale}>
          <Header />
          <main className="flex-1">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
