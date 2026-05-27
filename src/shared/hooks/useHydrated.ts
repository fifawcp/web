"use client";

import { useEffect, useState } from "react";

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical "have we hydrated yet?" flip
    setHydrated(true);
  }, []);
  return hydrated;
}
