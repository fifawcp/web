"use client";

import { useState } from "react";

import { getBoardMembers } from "@/features/boards/api/client";
import { BoardMembersList } from "@/features/boards/types/board.types";

export function useBoardMembers(boardId: string, initialData: BoardMembersList) {
  const [data, setData] = useState<BoardMembersList>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async (page: number) => {
    setIsLoading(true);
    setError(null);

    const res = await getBoardMembers(boardId, page, 20);
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error?.message || "Failed to load members");
    }

    setIsLoading(false);
  };

  const handlePageChange = async (page: number) => {
    await fetchMembers(page);
  };

  const refresh = async () => {
    await fetchMembers(data.pagination.page);
  };

  return {
    data,
    isLoading,
    error,
    handlePageChange,
    refresh,
  };
}
