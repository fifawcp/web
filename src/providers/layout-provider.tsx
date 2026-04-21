"use client";

import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { SessionProvider } from "./session-provider";

export function Providers({ children, messages, locale }: { children: React.ReactNode; messages: Record<string, unknown>; locale: string }) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <NextIntlClientProvider messages={messages} locale={locale} timeZone={timeZone}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
