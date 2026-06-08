"use client";

import { useEffect } from "react";

let hydrated = false;

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  useEffect(() => {
    hydrated = true;
  }, []);

  if (typeof window !== "undefined" && hydrated) return null;

  return <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
