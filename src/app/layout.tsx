import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getLocale, getMessages } from "next-intl/server";

import { Providers } from "@/providers/layout-provider";
import { Footer } from "@/shared/layout/Footer";
import { Header } from "@/shared/layout/Header";
import { cn } from "@/shared/lib/utils";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    <html lang="en" className={cn("h-full antialiased", "font-sans", inter.variable)} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <Providers messages={messages} locale={locale}>
          <Header />
          <main className="flex-1 overflow-x-clip">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
