"use client";

import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";

export function Providers({ children, messages, locale }: { children: React.ReactNode; messages: Record<string, unknown>; locale: string }) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
