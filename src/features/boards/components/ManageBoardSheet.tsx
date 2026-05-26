"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/shared/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

import { revalidateBoard } from "../api/boards";
import type { Board } from "../types/boards.types";

import { ManageBoardGeneral } from "./ManageBoardGeneral";
import { ManageBoardMembers } from "./ManageBoardMembers";

type Tab = "general" | "members";

const TAB_TRIGGER = "data-active:text-page-accent-strong dark:data-active:text-page-accent-strong data-active:ring-1 data-active:ring-page-accent/20";

type Props = {
  board: Board;
  currentUserId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManageBoardSheet({ board, currentUserId, open, onOpenChange }: Props) {
  const t = useTranslations("boards.manage");
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("general");

  // A management action returned FORBIDDEN — the viewer's role changed under them. Bust the
  // stale board cache before refreshing so the RSC drops controls like "Manage board".
  const handlePermissionLost = useCallback(async () => {
    onOpenChange(false);
    await revalidateBoard(board.id);
    router.refresh();
  }, [board.id, onOpenChange, router]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="flex h-full max-h-screen flex-col data-[vaul-drawer-direction=right]:w-80">
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle>{t("title", { name: board.name })}</DrawerTitle>
          <DrawerDescription className="sr-only">{board.name}</DrawerDescription>
        </DrawerHeader>
        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)} className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-4 mt-4 w-auto">
            <TabsTrigger value="general" className={TAB_TRIGGER}>
              {t("tabs.general")}
            </TabsTrigger>
            <TabsTrigger value="members" className={TAB_TRIGGER}>
              {t("tabs.members")}
            </TabsTrigger>
          </TabsList>
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
            <div className="px-4 py-4">
              <TabsContent value="general" className="m-0">
                <ManageBoardGeneral board={board} onClose={() => onOpenChange(false)} onPermissionLost={handlePermissionLost} />
              </TabsContent>
              <TabsContent value="members" className="m-0">
                <ManageBoardMembers board={board} currentUserId={currentUserId} enabled={open && tab === "members"} onPermissionLost={handlePermissionLost} />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
