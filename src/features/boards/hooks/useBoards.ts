"use client";

import { useQuery } from "@tanstack/react-query";

import { BOARDS_LIST_KEY, fetchBoards } from "../api/boards";
import type { BoardListItem } from "../types/boards.types";

export function useBoards(initialData?: BoardListItem[]) {
  return useQuery({
    queryKey: BOARDS_LIST_KEY,
    queryFn: fetchBoards,
    initialData,
  });
}
