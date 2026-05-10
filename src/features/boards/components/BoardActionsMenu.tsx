"use client";

import { useState } from "react";
import { Edit, LogOut, MoreVertical, Settings, Share2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/shared/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/components/ui/dropdown-menu";

interface BoardActionsMenuProps {
  isOwner: boolean;
  isAdmin: boolean;
  onShareClick: () => void;
  onUpdateClick: () => void;
  onDeleteLeaveClick: () => void;
}

export function BoardActionsMenu({ isOwner, isAdmin, onShareClick, onUpdateClick, onDeleteLeaveClick }: BoardActionsMenuProps) {
  const t = useTranslations("boards");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAction = (action: () => void) => {
    setDropdownOpen(false);
    action();
  };

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      {/* Mobile trigger */}
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="bg-background text-foreground px-3 py-2 w-auto flex-1 h-9.5">
          <MoreVertical className="h-4 w-4 md:hidden" />

          <span className="hidden md:flex items-center gap-2">
            <Settings className="h-3.5 w-3.5" />
            {t("manage.trigger")}
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48 md:w-auto">
        {/* Share - only in mobile dropdown */}
        <DropdownMenuItem className="gap-2 md:hidden" onClick={() => handleAction(onShareClick)}>
          <Share2 className="h-4 w-4" />
          {t("subheader.inviteFriends")}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="md:hidden" />

        {/* Manage items - shared between mobile and desktop */}

        {isAdmin && (
          <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleAction(onUpdateClick)}>
            <Edit className="h-4 w-4" />
            {t("update.trigger")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="gap-2 text-destructive cursor-pointer" onClick={() => handleAction(onDeleteLeaveClick)}>
          {isOwner ? (
            <>
              <Trash2 className="h-4 w-4" />
              {t("delete.trigger")}
            </>
          ) : (
            <>
              <LogOut className="h-3.5 w-3.5" />
              {t("leave.trigger")}
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
