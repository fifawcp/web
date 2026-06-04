"use client";

import { useTranslations } from "next-intl";

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/shared/components/ui/drawer";

import { useBoardPermissionLost } from "../hooks/useBoardPermissionLost";
import type { Board } from "../types/boards.types";

import { ManageBoardGeneral } from "./ManageBoardGeneral";

type Props = {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Board settings (rename, join code, delete). The member list now lives in its own board tab, so
// this sheet is general-settings only.
export function ManageBoardSheet({ board, open, onOpenChange }: Props) {
  const t = useTranslations("boards.manage");
  const handlePermissionLost = useBoardPermissionLost(board.id, () => onOpenChange(false));

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex h-full max-h-screen flex-col data-[vaul-drawer-direction=right]:w-80 sm:data-[vaul-drawer-direction=right]:w-96">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle>{t("title", { name: board.name })}</DrawerTitle>
          <DrawerDescription className="sr-only">{board.name}</DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-4">
          <ManageBoardGeneral board={board} onClose={() => onOpenChange(false)} onPermissionLost={handlePermissionLost} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
