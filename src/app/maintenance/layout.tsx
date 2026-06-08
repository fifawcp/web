import { Inter } from "next/font/google";

import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Isolated root layout (the app's real root lives under [locale]). Self-contained so
// the splash renders with zero dependency on the app shell, providers, or the API.
const noFlashTheme = `(function(){try{var t=localStorage.theme;var d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`h-full antialiased font-sans ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashTheme }} />
      </head>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
