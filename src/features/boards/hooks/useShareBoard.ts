import { useState } from "react";

import { BoardDetails } from "../types/board.types";

import { useRegenerateJoinCode } from "./useRegenerateJoinCode";

export const useShareBoard = ({ board, currentUserId }: { board: BoardDetails; currentUserId: string }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const { handleRegenerate, isRegenerating } = useRegenerateJoinCode(String(board.id));

  const joinCode = board.join_code || "";
  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/boards/join?code=${joinCode}` : "";
  const isAdminOrOwner = board.viewer.role === "admin" || board.owner_user_id === currentUserId;

  const copyCode = async () => {
    await navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return {
    open,
    setOpen,
    copied,
    setCopied,
    linkCopied,
    setLinkCopied,
    handleRegenerate,
    isRegenerating,
    copyCode,
    copyLink,
    joinCode,
    shareLink,
    isAdminOrOwner,
  };
};
