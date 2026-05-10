"use client";

import { useEffect, useState } from "react";

import { getBoardMembers } from "@/features/boards/api/client";
import { BoardMemberDetails } from "@/features/boards/types/board.types";
import { Pagination } from "@/shared/lib/api/types";

export function useBoardMembers(boardId: string, initialMembers: BoardMemberDetails[], initialPagination: Pagination) {
  const [members, setMembers] = useState<BoardMemberDetails[]>(initialMembers);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearch !== "") {
      fetchMembers(1, debouncedSearch);
    } else if (search === "") {
      // Only fetch if search was cleared
      fetchMembers(1, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const fetchMembers = async (page: number, searchQuery?: string) => {
    setIsLoading(true);
    setError(null);

    const res = await getBoardMembers(boardId, page, pagination.limit, searchQuery ?? debouncedSearch);
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
    search,
    setSearch,
    handlePageChange,
    refresh,
  };
}
