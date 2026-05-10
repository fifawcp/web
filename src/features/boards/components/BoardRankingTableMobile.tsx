"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { BoardDetails, BoardMemberDetails } from "@/features/boards/types/board.types";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";

import { MemberActionsCell } from "./MemberActionsCell";

interface BoardRankingTableMobileProps {
  board: BoardDetails;
  members: BoardMemberDetails[];
  currentUserId: string;
  onUpdateRole: (userId: string, newRole: "admin" | "member") => Promise<void>;
  onRemoveMember?: (userId: string) => void;
}

export function BoardRankingTableMobile({ board, members, currentUserId, onUpdateRole, onRemoveMember }: BoardRankingTableMobileProps) {
  const t = useTranslations("boards.ranking");
  const [mobileStatView, setMobileStatView] = useState<"total" | "pickem" | "matchScore" | "hits" | "outcomes">("total");

  const statOptions: Record<"total" | "pickem" | "matchScore" | "hits" | "outcomes", { label: string; key: keyof BoardMemberDetails }> = {
    total: { label: t("total"), key: "total_points" },
    pickem: { label: t("pickem"), key: "pickem_points" },
    matchScore: { label: t("matchScore"), key: "match_score_points" },
    hits: { label: t("hits"), key: "exact_hits" },
    outcomes: { label: t("outcomes"), key: "correct_outcomes" },
  };

  const statKeys = Object.keys(statOptions) as Array<keyof typeof statOptions>;
  const currentStatIndex = statKeys.indexOf(mobileStatView);

  const handlePreviousStat = () => {
    const newIndex = currentStatIndex === 0 ? statKeys.length - 1 : currentStatIndex - 1;
    setMobileStatView(statKeys[newIndex]);
  };

  const handleNextStat = () => {
    const newIndex = currentStatIndex === statKeys.length - 1 ? 0 : currentStatIndex + 1;
    setMobileStatView(statKeys[newIndex]);
  };

  return (
    <div className="md:hidden rounded-lg border bg-card overflow-hidden">
      <Table className="w-full">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="text-xs uppercase text-muted-foreground text-center w-12 p-2">#</TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground w-auto p-2">{t("member")}</TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground text-center w-30 p-0">
              <div className="flex items-center justify-center h-full">
                <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={handlePreviousStat}>
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="text-[10px] font-semibold min-w-0 flex-1 truncate px-0.5">{statOptions[mobileStatView].label}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={handleNextStat}>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </TableHead>
            <TableHead className="w-8 p-0"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length > 0 ? (
            members.map((member) => {
              const isCurrentUser = member.user_id === currentUserId;
              const initials = member.username.slice(0, 2).toUpperCase();
              const statValue = member[statOptions[mobileStatView].key];

              return (
                <TableRow key={member.user_id}>
                  <TableCell className={`text-center p-2 ${isCurrentUser ? "text-gradient-secondary" : "text-muted-foreground"} text-[11px] font-medium`}>
                    {String(member.rank).padStart(2, "0")}
                  </TableCell>
                  <TableCell className="p-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-[10px] bg-muted">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[11px] font-medium truncate ${isCurrentUser ? "text-gradient-secondary" : ""}`}>
                          {member?.first_name || ""} {member?.last_name || ""}
                        </p>
                        <p className={`text-[10px] text-muted-foreground truncate ${isCurrentUser ? "text-gradient-secondary" : ""}`}>@{member.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center p-2">
                    <span className={`text-[11px] font-bold ${mobileStatView === "total" ? "" : "text-muted-foreground"}`}>{statValue}</span>
                  </TableCell>
                  <TableCell className="p-1">
                    <MemberActionsCell board={board} member={member} currentUserId={currentUserId} onUpdateRole={onUpdateRole} onRemoveMember={onRemoveMember} />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-sm">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
