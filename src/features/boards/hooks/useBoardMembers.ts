"use client";

import { useState } from "react";

import { getBoardMembers } from "@/features/boards/api/client";
import { BoardMemberDetails } from "@/features/boards/types/board.types";
import { Pagination } from "@/shared/lib/api/types";

export function useBoardMembers(boardId: string, initialMembers: BoardMemberDetails[], initialPagination: Pagination) {
  const [members, setMembers] = useState<BoardMemberDetails[]>(initialMembers);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async (page: number) => {
    setIsLoading(true);
    setError(null);

    const res = await getBoardMembers(boardId, page, pagination.limit);
    if (res.success && res.data && res.pagination) {
      setMembers(res.data);
      setPagination(res.pagination);
    } else {
      setError(res.error?.message || "Failed to load members");
    }

    setIsLoading(false);
  };

  const handlePageChange = async (page: number) => {
    await fetchMembers(page);
  };

  const refresh = async () => {
    await fetchMembers(pagination.page);
  };

  return {
    members,
    pagination,
    isLoading,
    error,
    handlePageChange,
    refresh,
  };
}
