"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPickems, PICKEMS_QUERY_KEY } from "../api/pickems";
import type { UserPickem } from "../types/pickems.types";

export function usePickems(initialData?: UserPickem) {
  return useQuery({
    queryKey: PICKEMS_QUERY_KEY,
    queryFn: fetchPickems,
    initialData,
  });
}
